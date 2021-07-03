const query = `
query {
  positions(where: {owner_in: ["owner goes here"]}) {
    tickLower
    tickUpper
    owner
    token0 {
      symbol
    }
    token1 {
      symbol
    }
   	depositedToken0
    depositedToken1
  }
}`;
