# The dune query


```sql
WITH sns_transfers AS (
  SELECT
    "to" as recipient,
    "from" as sender,
    contract_address
  FROM
    nft.transfers
  WHERE
    blockchain = 'polygon'
    AND contract_address = from_hex(SUBSTRING('{{sns_address}}', 3))
),
sns_balances AS (
  SELECT
    recipient,
    COUNT(*) - COALESCE((
      SELECT COUNT(*) 
      FROM sns_transfers t2
      WHERE t2.sender = sns_transfers.recipient
    ), 0) as net_balance
  FROM sns_transfers
  GROUP BY recipient
),
seed_transfers AS (
  SELECT
    "to" as recipient,
    "from" as sender,
    contract_address
  FROM
    nft.transfers
  WHERE
    blockchain = 'ethereum'
    AND contract_address = from_hex(SUBSTRING('{{seed_address}}', 3))
),
seed_balances AS (
  SELECT
    recipient,
    COUNT(*) - COALESCE((
      SELECT COUNT(*) 
      FROM seed_transfers t2
      WHERE t2.sender = seed_transfers.recipient
    ), 0) as net_balance
  FROM seed_transfers
  GROUP BY recipient
),
scr_transfers AS (
  SELECT
    wallet_address,
    token_address,
    amount_raw
  FROM
    transfers_polygon.erc20
  WHERE
    token_address = from_hex(SUBSTRING('{{scr_address}}', 3))
),
scr_balances AS (
  SELECT
    wallet_address,
    SUM(amount_raw) AS total_balance
  FROM scr_transfers
  GROUP BY wallet_address
)
SELECT
  (SELECT COUNT(*) FROM sns_balances WHERE net_balance > 0 AND recipient != 0x0000000000000000000000000000000000000000 AND recipient != 0x000000000000000000000000000000000000dead) AS sns_holders,
  (SELECT COUNT(*) FROM seed_balances WHERE net_balance > 0 AND recipient != 0x0000000000000000000000000000000000000000 AND recipient != 0x000000000000000000000000000000000000dead) AS seed_holders,
  (SELECT COUNT(*) FROM scr_balances WHERE total_balance > 0 AND wallet_address != 0x0000000000000000000000000000000000000000 AND wallet_address != 0x000000000000000000000000000000000000dead) AS scr_holders
```