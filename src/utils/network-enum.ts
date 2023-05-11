enum Networks {
    Moonbeam,
    Moonriver
}


export interface enumNetwork {
    chainId: string
    name: string
    networkType: Networks
}

export const moonbeam: enumNetwork = {
    chainId: "0xfe58ea77779b7abda7da4ec526d14db9b1e9cd40a217c34892af80a9b332b76d",
    name: "moonbeam",
    networkType: Networks.Moonbeam
}

export const moonriver: enumNetwork = {
    chainId: "0x401a1f9dca3da46f5c4091016c8a2f26dcea05865116b286f60f668207d1474b",
    name: "moonriver",
    networkType: Networks.Moonriver
}