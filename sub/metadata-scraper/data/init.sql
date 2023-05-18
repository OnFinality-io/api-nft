CREATE SCHEMA IF NOT EXISTS "my_schema";

CREATE TABLE IF NOT EXISTS "my_schema".data (
id text not null primary key,
metadata jsonb,
metadata_url text,
metadata_status text
);

INSERT INTO "my_schema".data ("id", "metadata_url", "metadata_status") values('1', 'ipfs://QmQGsXVt5o8Qf2J3to21RJYdHsNZQaVFosPYNSMS5CHW7U/2.json', 'PENDING');
INSERT INTO "my_schema".data ("id", "metadata_url", "metadata_status") values('2', 'https://arweave.net/KTpuWvFpa8Fgj7t1dUVwZ2yhpfHWMcN8vkziGrwxbcg', 'PENDING');
INSERT INTO "my_schema".data ("id", "metadata_url", "metadata_status") values('3', 'data:application/json;base64,eyJpZCI6IDEyM30K', 'PENDING');