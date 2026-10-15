
"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

type Predio = {
  id: string
  name: string | null
  slug: string | null
  city: string | null
  address?: string | null
  lat?: number | null
  lng?: number | null
  description?: string | null
  created_at?: string | null
}

export default function PrediosLista({
  predios,
}: {
  predios: Predio[]
}) {
  const router = useRouter()
  const supabase = createClient()

  const [busca, setBusca] = useState("")
  const [detalheAberto, setDetalheAberto] = useState<string | null>(null)
  const [excluindo, setExcluindo] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState("")
  const [erro, setErro] = useState("")

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR")

    if (!termo) return predios

    return predios.filter((p) =>
      [p.name, p.city, p.slug, p.address]
        .some((valor) =>
          (valor ?? "").toLocaleLowerCase("pt-BR").includes(termo)
        )
    )
  }, [predios, busca])

  async function excluirPredio(predio: Predio) {
    const confirmado = window.confirm(
      `Tem certeza de que deseja excluir o prédio "${predio.name}"? Esta ação não poderá ser desfeita.`
    )

    if (!confirmado) return

    setExcluindo(predio.id)
    setErro("")
    setMensagem("")

    const { error } = await supabase
      .from("buildings")
      .delete()
      .eq("id", predio.id)

    setExcluindo(null)

    if (error) {
      setErro(
        `Não foi possível excluir o prédio. ${error.message}`
      )
      return
    }

    setMensagem("Prédio excluído com sucesso.")
    setDetalheAberto(null)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <label
          htmlFor="buscar-predio"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Buscar prédio
        </label>

        <input
          id="buscar-predio"
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Digite o nome, a cidade, o endereço ou o slug..."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />

        <p className="mt-2 text-sm text-gray-500">
          {filtrados.length} de {predios.length} prédio(s)
        </p>
      </div>

      {mensagem && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"
        >
          {mensagem}
        </div>
      )}

      {erro && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {erro}
        </div>
      )}

      {predios.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <div className="text-4xl">🏢</div>
          <h2 className="mt-3 font-bold text-gray-800">
            Nenhum prédio cadastrado
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Cadastre o primeiro prédio para começar.
          </p>
          <Link
            href="/admin/predios/novo"
            className="mt-5 inline-flex rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800"
          >
            Cadastrar prédio
          </Link>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="font-semibold text-gray-800">
            Nenhum resultado encontrado
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Tente pesquisar por outro nome ou cidade.
          </p>
          <button
            type="button"
            onClick={() => setBusca("")}
            className="mt-4 text-sm font-semibold text-blue-700 hover:underline"
          >
            Limpar busca
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtrados.map((p) => {
            const aberto = detalheAberto === p.id

            return (
              <article
                key={p.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                      🏢
                    </div>

                    <div className="min-w-0">
                      <h2 className="break-words text-lg font-bold text-gray-900">
                        {p.name || "Prédio sem nome"}
                      </h2>
                      <p className="mt-1 text-sm text-gray-600">
                        {p.city || "Cidade não informada"}
                      </p>
                      <p className="mt-1 break-all text-xs text-gray-400">
                        Slug: /{p.slug || "não definido"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setDetalheAberto(aberto ? null : p.id)
                      }
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {aberto ? "Ocultar detalhes" : "Ver detalhes"}
                    </button>

                    <Link
                      href={`/admin/predios/${encodeURIComponent(p.id)}/editar`}
                      className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                    >
                      Editar
                    </Link>

                    <button
                      type="button"
                      onClick={() => excluirPredio(p)}
                      disabled={excluindo === p.id}
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {excluindo === p.id ? "Excluindo..." : "Excluir"}
                    </button>
                  </div>
                </div>

                {aberto && (
                  <div className="border-t border-gray-100 bg-gray-50 p-5">
                    <h3 className="mb-3 font-bold text-gray-800">
                      Detalhes do prédio
                    </h3>

                    <dl className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Nome
                        </dt>
                        <dd className="mt-1 break-words text-sm text-gray-900">
                          {p.name || "Não informado"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Cidade
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {p.city || "Não informada"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Slug
                        </dt>
                        <dd className="mt-1 break-all text-sm text-gray-900">
                          {p.slug || "Não informado"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Endereço
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {p.address || "Não informado"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Latitude
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {p.lat ?? "Não informada"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Longitude
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {p.lng ?? "Não informada"}
                        </dd>
                      </div>

                      <div className="sm:col-span-2">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Descrição
                        </dt>
                        <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-900">
                          {p.description || "Sem descrição cadastrada."}
                        </dd>
                      </div>
                    </dl>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}