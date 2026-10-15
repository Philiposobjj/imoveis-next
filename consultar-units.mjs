
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "node:fs"

const env = readFileSync(".env", "utf8")

function getEnv(name) {
  const line = env
    .split(/\r?\n/)
    .find((item) => item.trim().startsWith(`${name}=`))

  return line
    ?.slice(line.indexOf("=") + 1)
    .trim()
    .replace(/^["']|["']$/g, "")
}

const url = getEnv("NEXT_PUBLIC_SUPABASE_URL")
const key = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if (!url || !key) {
  console.error("Não encontrei a URL ou a chave pública no arquivo .env.")
  process.exit(1)
}

const supabase = createClient(url, key)

const { data, error } = await supabase
  .from("units")
  .select("*")
  .limit(1)

if (error) {
  console.error("Erro ao consultar units:", error.message)
  process.exit(1)
}

console.log("Consulta realizada.")
console.log("Quantidade de registros retornados:", data.length)

if (data.length > 0) {
  console.log("Colunas da tabela units:")
  console.log(Object.keys(data[0]).join(", "))
} else {
  console.log("A tabela está vazia; consultando os metadados não foi possível descobrir as colunas por registros.")
}