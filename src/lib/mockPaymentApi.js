// Mocks the account-name resolution step used by real Nigerian payment
// providers (e.g. Paystack) when connecting a settlement account: once a
// bank and a valid 10-digit account number are supplied, the account
// holder's name is verified and returned automatically.

const delay = (ms = 900) => new Promise((resolve) => setTimeout(resolve, ms))

const MOCK_NAMES = ['Adaeze Okafor', 'Tunde Bakare', 'Ngozi Umeh', 'Chinedu Eze', 'Aisha Bello', 'Femi Adegoke']

export async function resolveAccountName({ bankName, accountNumber }) {
  await delay()
  if (!bankName) {
    throw new Error('Select a bank first.')
  }
  if (!/^\d{10}$/.test(accountNumber)) {
    throw new Error('Enter a valid 10-digit account number.')
  }
  const index = Number(accountNumber.slice(-1)) % MOCK_NAMES.length
  return { accountHolderName: MOCK_NAMES[index] }
}
