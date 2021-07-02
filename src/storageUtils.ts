type StorageKey = string
type StorageValue = string
interface StorageItem {
  key: StorageKey
  value: any
}

type StorageSetCallback = () => void
type StorageGetCallback = (returnValues: any) => void

const addressStorageKey = 'addresses'

export const setStorageValue = (item: StorageItem, cb: StorageSetCallback) => {
  console.error(JSON.stringify(item))
  chrome.storage.sync.set({ [item.key]: item.value }, cb)
}

export const getStorageValue = (item: StorageKey, cb: StorageGetCallback) => {
  chrome.storage.sync.get(item, (items: any) => cb(items ?? []))
}

export const setAddressesStorage = (
  addresses: string[],
  cb: StorageSetCallback
) => {
  setStorageValue({ key: addressStorageKey, value: addresses }, cb)
}

export const getAddressesStorage = (cb: StorageGetCallback) => {
  getStorageValue(addressStorageKey, (items: any) => cb(items.addresses ?? []))
}
