
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function NovoPredioPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [city, setCity] = useState("")
  const [address, setAddress] = useState("")
  const [lat, setLat] = useState("")
  const [lng, setLng] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const supabase = createClient()

      const { error: insertError } = await supabase
        .from("buildings")
        .insert({
          name: name.trim(),
          slug: slug.trim(),
          city: city.trim(),
          address: address.trim() || null,
          lat: lat ? Number(lat) : null,
          lng: lng ? Number(lng) : null,
          description: description.trim() || null,
        })

      if (insertError) {
        setError(insertError.message)
        return
      }

      router.push("/admin/predios")
      router.refresh()
    } catch (err) {
      console.error("Erro ao cadastrar prédio:", err)

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível cadastrar o prédio. Tente novamente."
      )
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"

  const labelClass =
    "mb-2 block text-sm font-bold text-slate-700"

  return (
    <main className="mx-auto max-w-4xl space-y-7">
      <Link
        href="/admin/predios"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-700"
      >
        ← Voltar para prédios
      </Link>

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 p-7 text-white shadow-xl sm:p-9">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl"
        />

        <div className="relative flex items-center gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-3xl">
            +
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
              Cadastro de empreendimento
            </span>

            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Novo prédio
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100/80 sm:text-base">
              Preencha os dados do empreendimento para cadastrá-lo no sistema.
            </p>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-6 border-b border-slate-100 pb-5">
            <h2 className="text-lg font-extrabold text-slate-950">
              Informações do prédio
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Informe o nome, identificador e localização do empreendimento.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="name" className={labelClass}>
                Nome do prédio *
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={150}
                className={inputClass}
                placeholder="Ex.: Residencial Costa Azul"
              />
            </div>

            <div>
              <label htmlFor="slug" className={labelClass}>
                Slug *
              </label>

              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                maxLength={150}
                pattern="[a-zA-Z0-9-]+"
                title="Use apenas letras sem acentos, números e hífens."
                className={inputClass}
                placeholder="residencial-costa-azul"
              />

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Identificador único, sem espaços ou acentos. Use hífens entre
                as palavras.
              </p>
            </div>

            <div>
              <label htmlFor="city" className={labelClass}>
                Cidade *
              </label>

              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                maxLength={120}
                className={inputClass}
                placeholder="Florianópolis"
              />
            </div>

            <div>
              <label htmlFor="address" className={labelClass}>
                Endereço
              </label>

              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                maxLength={250}
                className={inputClass}
                placeholder="Rua, número e bairro"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-6 border-b border-slate-100 pb-5">
            <h2 className="text-lg font-extrabold text-slate-950">
              Localização no mapa
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Coordenadas opcionais para posicionar o empreendimento no mapa.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="lat" className={labelClass}>
                Latitude
              </label>

              <input
                id="lat"
                type="number"
                step="any"
                min="-90"
                max="90"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className={inputClass}
                placeholder="-27.5954"
              />
            </div>

            <div>
              <label htmlFor="lng" className={labelClass}>
                Longitude
              </label>

              <input
                id="lng"
                type="number"
                step="any"
                min="-180"
                max="180"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className={inputClass}
                placeholder="-48.5480"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-6 border-b border-slate-100 pb-5">
            <h2 className="text-lg font-extrabold text-slate-950">
              Descrição
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Adicione informações úteis sobre o empreendimento.
            </p>
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>
              Sobre o prédio
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              maxLength={3000}
              className={`${inputClass} resize-y`}
              placeholder="Descreva o empreendimento, suas características e diferenciais..."
            />

            <p className="mt-2 text-right text-xs text-slate-400">
              {description.length}/3000 caracteres
            </p>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="break-words rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
          >
            <p className="font-bold">Não foi possível salvar o prédio</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/admin/predios"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-7 py-3 font-extrabold text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {loading ? "Salvando..." : "Salvar prédio →"}
          </button>
        </div>
      </form>
    </main>
  )
}
