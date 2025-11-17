import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GenericUserSelection } from "~/components/GenericUserSelection";
import { createProcessToken, fetchAllMoovAccounts } from "~/utils";
import { useMoovMethods, usePlaidMethods } from "~/hooks";
import type { Route } from "../+types/root";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "[WIO] - Add Bank Account" },
    {
      name: "description",
      content: "Link your bank account securely as a WIO",
    },
  ];
}

export default function AddBankAccount() {
  const [accounts, setAccounts] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const moovRef = useRef(null);

  const { generateMoovToken } = useMoovMethods();
  const { generatePlaidToken } = usePlaidMethods();

  const onSuccess = useCallback((moovBankAccount) => {
    console.log("Successfully Added Bank Account", moovBankAccount);
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      generatePlaidToken().then((data) => {
        console.log("PLAID TOKEN GENERATED => ", data.link_token);
        const plaidToken = data.link_token;

        // @ts-ignore
        if (window.Moov && plaidToken) {
          generateMoovToken(selectedAccount).then((result) => {
            let Moov = moovRef.current;

            Moov.plaid = {
              env: "sandbox",
              redirectURL: "https://localhost:5173",
              token: plaidToken,
              onSuccess,
              onExit: (err, metadata) => {
                console.log("PLAID PROCESS EXITED: err =>", err);
                console.log("PLAID PROCESS EXITED: metadata =>", metadata);
              },
              onLoad: () => {
                console.log("PLAID LINK RESOURCE LOADED");
              },
              onProcessorTokenRequest: async (
                public_token,
                bank_account_id
              ) => {
                console.log(
                  "GENERATING PROCESSOR TOKEN FOR BANK ACCOUNT => ",
                  bank_account_id
                );

                const plaidAccountProcessorToken = await createProcessToken(
                  public_token,
                  bank_account_id
                );

                const { processor_token } =
                  await plaidAccountProcessorToken.json();

                console.log("PROCESSOR TOKEN => ", processor_token);
                return processor_token;
              },
            };

            Moov.token = result.access_token;
            Moov.accountID = selectedAccount;
            Moov.paymentMethodTypes = ["bankAccount"];
            Moov.showLogo = true;
            Moov.onResourceCreated = (result) => {
              console.log("BANK ACCOUNT SUCCESSFULLY ADDED", result);
            };
          });
        } else {
          console.warn("Moov SDK not loaded yet");
        }
      });
    }
  }, [selectedAccount]);

  const openInterface = () => {
    if (moovRef.current) {
      moovRef.current.open = true;
    }
  };

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllMoovAccounts();
      if (data.accounts?.length > 0) {
        setAccounts(data.accounts ?? []);
      }
    } catch (error) {
      console.error("There was an error fetching Moov accounts", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="flex flex-col w-full h-screen items-center justify-center gap-6 p-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">[WIO] - Add Bank Account</h1>
        <p className="text-gray-400 max-w-md">
          Securely link your bank account using Plaid to enable payments and
          transfers.
        </p>
      </div>

      <div>
        {accounts?.length > 0 ? (
          <GenericUserSelection
            selectedItem={selectedAccount}
            data={accounts ?? []}
            isLoading={isLoading}
            onSelect={(account) => setSelectedAccount(account)}
          />
        ) : (
          <div>
            <button
              disabled={isLoading}
              className="text-black font-black cursor-pointer disabled:pointer-events-none disabled:opacity-25 disabled:cursor-not-allowed hover:scale-105 transition-all p-4 px-5 glow-box flex items-center gap-4"
              onClick={fetchAccounts}>
              Fetch Moov Accounts{" "}
              {isLoading && (
                <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-green-600" />
              )}
            </button>
          </div>
        )}
      </div>

      {selectedAccount && (
        <button
          className="text-black font-black cursor-pointer hover:scale-105 transition-all p-4 px-5 glow-box"
          onClick={openInterface}>
          Link Bank Account with Moov & Plaid
        </button>
      )}

      {/* @ts-ignore */}
      <moov-payment-methods ref={moovRef} />
    </div>
  );
}
