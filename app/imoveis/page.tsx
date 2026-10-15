
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type BuscaParams = {
  busca?: string
  tipo?: string
  quartos?: string
  banheiros?: string
  precoMax?: string
}

type Predio = {
  name?: string | null
  city?: string | null
  address?: string | null
}

type Imovel = {
  id: string | number
  title?: string | null
  description?: string | null
  bedrooms?: number | null
  bathrooms?: number | null
  area_m2?: number | null
  floor?: number | null
  status?: string | null
  status_comercial?: string | null
  tipo_anuncio?: string | null
  preco?: number | null
  publicado?: boolean | null
  fotos?: unknown
  building_id?: string | null
  buildings?: Predio | Predio[] | null
}

const modalidades = [
  { value: '', label: 'Todas as modalidades' },
  { value: 'comprar', label: 'Comprar' },
  { value: 'alugar', label: 'Alugar' },
  { value: 'temporada', label: 'Temporada' },
]

function normalizar(valor: unknown): string {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim()
}

function numeroValido(valor?: string): number | null {
  if (!valor || !valor.trim()) return null

  const numero = Number(valor)

  return Number.isFinite(numero) && numero >= 0 ? numero : null
}

function formatarPreco(imovel: Imovel): string {
  if (imovel.preco == null) return 'Consulte o preço'

  const valor = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(Number(imovel.preco))

  if (imovel.tipo_anuncio === 'aluguel') return `${valor}/mês`
  if (imovel.tipo_anuncio === 'temporada') return `${valor}/dia`

  return valor
}

function nomeTipo(tipo?: string | null): string {
  if (tipo === 'venda') return 'À venda'
  if (tipo === 'aluguel') return 'Para alugar'
  if (tipo === 'temporada') return 'Temporada'

  return 'Imóvel'
}

function extrairFoto(valor: unknown): string | null {
  if (typeof valor === 'string') {
    const texto = valor.trim()

    if (!texto) return null
    if (/^https?:\/\//i.test(texto)) return texto

    try {
      const convertido: unknown = JSON.parse(texto)

      if (convertido !== valor) return extrairFoto(convertido)
    } catch {
      // O texto pode ser o caminho do arquivo no Storage.
    }

    return texto
  }

  if (Array.isArray(valor)) {
    for (const item of valor) {
      const foto = extrairFoto(item)
      if (foto) return foto
    }

    return null
  }

  if (valor && typeof valor === 'object') {
    const objeto = valor as Record<string, unknown>

    for (const chave of ['url', 'publicUrl', 'public_url', 'path', 'name', 'src']) {
      if (objeto[chave]) {
        const foto = extrairFoto(objeto[chave])
        if (foto) return foto
      }
    }
  }

  return null
}

function obterFoto(valor: unknown, supabaseUrl: string): string | null {
  const caminho = extrairFoto(valor)

  if (!caminho) return null
  if (/^https?:\/\//i.test(caminho)) return caminho

  const caminhoLimpo = caminho
    .replace(/^\/+/, '')
    .replace(/^storage\/v1\/object\/public\/fotos\//, '')
    .replace(/^fotos\//, '')

  if (!caminhoLimpo || !supabaseUrl) return null

  return `${supabaseUrl.replace(/\/+$/, '')}/storage/v1/object/public/fotos/${caminhoLimpo
    .split('/')
    .map((parte) => encodeURIComponent(parte))
    .join('/')}`
}

function obterPredio(imovel: Imovel): Predio {
  if (Array.isArray(imovel.buildings)) {
    return imovel.buildings[0] ?? {}
  }

  return imovel.buildings ?? {}
}

export default async function ImoveisPage({
  searchParams,
}: {
  searchParams: Promise<BuscaParams>
}) {
  const params = await searchParams

  const busca = params.busca?.trim() ?? ''
  const tipo = params.tipo ?? ''
  const quartos = numeroValido(params.quartos)
  const banheiros = numeroValido(params.banheiros)
  const precoMax = numeroValido(params.precoMax)

  const supabase = await createClient()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

  const { data, error } = await supabase
    .from('units')
    .select('*')
    .order('created_at', { ascending: false })

  let imoveis = (data ?? []) as Imovel[]

  imoveis = imoveis.filter((imovel) => {
    const publicado =
      imovel.publicado === true ||
      String(imovel.publicado).toLowerCase() === 'true'

    const statusFisico = normalizar(imovel.status)
    const statusComercial = normalizar(imovel.status_comercial)

    const fisicoDisponivel =
      !statusFisico || statusFisico === 'disponivel'

    const comercialDisponivel =
      !statusComercial || statusComercial === 'disponivel'

    return publicado && fisicoDisponivel && comercialDisponivel
  })

  if (tipo === 'comprar') {
    imoveis = imoveis.filter(
      (imovel) => normalizar(imovel.tipo_anuncio) === 'venda'
    )
  } else if (tipo === 'alugar') {
    imoveis = imoveis.filter(
      (imovel) => normalizar(imovel.tipo_anuncio) === 'aluguel'
    )
  } else if (tipo === 'temporada') {
    imoveis = imoveis.filter(
      (imovel) => normalizar(imovel.tipo_anuncio) === 'temporada'
    )
  }

  if (busca) {
    const termo = normalizar(busca)

    imoveis = imoveis.filter((imovel) => {
      const predio = obterPredio(imovel)

      const texto = [
        imovel.title,
        imovel.description,
        predio.name,
        predio.city,
        predio.address,
      ].map(normalizar).join(' ')

      return texto.includes(termo)
    })
  }

  if (quartos !== null) {
    imoveis = imoveis.filter(
      (imovel) =>
        imovel.bedrooms != null &&
        Number(imovel.bedrooms) >= quartos
    )
  }

  if (banheiros !== null) {
    imoveis = imoveis.filter(
      (imovel) =>
        imovel.bathrooms != null &&
        Number(imovel.bathrooms) >= banheiros
    )
  }

  if (precoMax !== null) {
    imoveis = imoveis.filter(
      (imovel) =>
        imovel.preco != null &&
        Number(imovel.preco) <= precoMax
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 text-xl font-black text-white shadow-md">
              I
            </span>
            <span>
              <span className="block text-xl font-extrabold tracking-tight text-slate-950">
                Imóveis<span className="text-blue-700"> Next</span>
              </span>
              <span className="hidden text-xs text-slate-500 sm:block">
                Seu próximo endereço começa aqui
              </span>
            </span>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-blue-800 sm:inline-flex"
            >
              Início
            </Link>
            <Link
              href="/admin/login"
              className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
            >
              Área administrativa
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 px-5 py-12 text-white md:py-16">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-200 transition hover:text-white"
          >
            ← Voltar ao início
          </Link>

          <div className="mt-7 max-w-3xl">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
              Encontre seu lugar
            </span>
            <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:text-4xl md:text-5xl">
              Um novo endereço para os seus próximos capítulos.
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-blue-100/85">
              Explore imóveis para comprar, alugar ou aproveitar por temporada.
              Use os filtros para encontrar opções que combinam com você.
            </p>
          </div>

          <form
            action="/imoveis"
            method="get"
            className="mt-9 rounded-3xl border border-white/60 bg-white p-5 text-slate-900 shadow-2xl shadow-slate-950/20 md:p-7"
          >
            <div className="mb-5">
              <h2 className="text-lg font-extrabold text-slate-950">
                Encontre seu imóvel
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Personalize a busca com os filtros abaixo.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              <div className="sm:col-span-2 lg:col-span-2">
                <label htmlFor="busca" className="mb-2 block text-sm font-bold text-slate-700">
                  Cidade, bairro ou imóvel
                </label>
                <input
                  id="busca"
                  name="busca"
                  type="search"
                  defaultValue={busca}
                  placeholder="Ex.: Campeche, Centro..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label htmlFor="tipo" className="mb-2 block text-sm font-bold text-slate-700">
                  Modalidade
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  defaultValue={tipo}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                >
                  {modalidades.map((modalidade) => (
                    <option key={modalidade.value} value={modalidade.value}>
                      {modalidade.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="quartos" className="mb-2 block text-sm font-bold text-slate-700">
                  Quartos
                </label>
                <select
                  id="quartos"
                  name="quartos"
                  defaultValue={params.quartos ?? ''}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">Qualquer</option>
                  {[1, 2, 3, 4, 5].map((quantidade) => (
                    <option key={quantidade} value={quantidade}>
                      {quantidade} ou mais
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="banheiros" className="mb-2 block text-sm font-bold text-slate-700">
                  Banheiros
                </label>
                <select
                  id="banheiros"
                  name="banheiros"
                  defaultValue={params.banheiros ?? ''}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">Qualquer</option>
                  {[1, 2, 3, 4].map((quantidade) => (
                    <option key={quantidade} value={quantidade}>
                      {quantidade} ou mais
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-4">
                <label htmlFor="precoMax" className="mb-2 block text-sm font-bold text-slate-700">
                  Preço máximo (R$)
                </label>
                <input
                  id="precoMax"
                  name="precoMax"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={params.precoMax ?? ''}
                  placeholder="Ex.: 500000"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="flex items-end sm:col-span-1">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-blue-700 px-5 py-3.5 font-bold text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800"
                >
                  Buscar imóveis →
                </button>
              </div>

              <div className="flex items-end sm:col-span-1">
                <Link
                  href="/imoveis"
                  className="w-full rounded-xl border border-slate-200 px-5 py-3.5 text-center font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
                >
                  Limpar filtros
                </Link>
              </div>
            </div>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 md:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-700">
              Nossa seleção
            </span>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Imóveis disponíveis
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {imoveis.length}{' '}
              {imoveis.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-800"
          >
            ← Início
          </Link>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
            <h3 className="font-bold">Não foi possível carregar os imóveis.</h3>
            <p className="mt-2 text-sm">{error.message}</p>
          </div>
        ) : imoveis.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl text-blue-700">
              ⌂
            </div>
            <h3 className="mt-5 text-xl font-extrabold text-slate-900">
              Nenhum imóvel encontrado
            </h3>
            <p className="mx-auto mt-2 max-w-lg leading-6 text-slate-500">
              Tente alterar os filtros ou limpar a busca. Os imóveis precisam estar publicados e disponíveis para aparecer aqui.
            </p>
            <Link
              href="/imoveis"
              className="mt-6 inline-flex rounded-xl bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800"
            >
              Limpar filtros
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {imoveis.map((imovel) => {
              const predio = obterPredio(imovel)
              const foto = obterFoto(imovel.fotos, supabaseUrl)

              return (
                <article
                  key={imovel.id}
                  className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-900/10"
                >
                  <Link
                    href={`/imoveis/${imovel.id}`}
                    className="relative block h-56 overflow-hidden bg-slate-100"
                  >
                    {foto ? (
                      <img
                        src={foto}
                        alt={imovel.title ?? 'Foto do imóvel'}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-blue-100 text-blue-900">
                        <div className="text-center">
                          <span className="text-5xl" aria-hidden="true">⌂</span>
                          <p className="mt-2 text-sm font-medium">Foto não cadastrada</p>
                        </div>
                      </div>
                    )}

                    <span className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-xs font-extrabold text-blue-800 shadow-sm">
                      {nomeTipo(imovel.tipo_anuncio)}
                    </span>
                  </Link>

                  <div className="p-5 sm:p-6">
                    <p className="flex items-center gap-2 text-sm text-slate-500">
                      <span aria-hidden="true" className="text-blue-700">⌖</span>
                      {predio.city || predio.address || 'Localização não informada'}
                    </p>

                    <h3 className="mt-3 text-xl font-extrabold leading-snug text-slate-950 transition group-hover:text-blue-800">
                      {imovel.title || 'Imóvel sem título'}
                    </h3>

                    {predio.name && (
                      <p className="mt-1 text-sm font-medium text-slate-500">
                        {predio.name}
                      </p>
                    )}

                    {imovel.description && (
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                        {imovel.description}
                      </p>
                    )}

                    <div className="mt-5 flex flex-wrap gap-x-4 gap-y-3 border-t border-slate-100 pt-4 text-sm text-slate-600">
                      {imovel.bedrooms != null && (
                        <span className="inline-flex items-center gap-1.5">
                          <span aria-hidden="true">▣</span>
                          {imovel.bedrooms} quartos
                        </span>
                      )}
                      {imovel.bathrooms != null && (
                        <span className="inline-flex items-center gap-1.5">
                          <span aria-hidden="true">◉</span>
                          {imovel.bathrooms} banheiros
                        </span>
                      )}
                      {imovel.area_m2 != null && (
                        <span className="inline-flex items-center gap-1.5">
                          <span aria-hidden="true">↔</span>
                          {imovel.area_m2} m²
                        </span>
                      )}
                    </div>

                    <div className="mt-5 flex items-end justify-between gap-3 border-t border-slate-100 pt-5">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-500">
                          {imovel.tipo_anuncio === 'venda'
                            ? 'Preço'
                            : imovel.tipo_anuncio === 'aluguel'
                              ? 'Aluguel'
                              : 'Diária'}
                        </p>
                        <p className="mt-1 break-words text-lg font-black tracking-tight text-slate-950">
                          {formatarPreco(imovel)}
                        </p>
                      </div>

                      <Link
                        href={`/imoveis/${imovel.id}`}
                        className="shrink-0 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
                      >
                        Ver detalhes →
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section className="px-5 pb-12">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-blue-800 via-blue-900 to-slate-950 p-7 text-white shadow-xl sm:p-10">
          <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
                Área administrativa
              </span>
              <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                Tem um imóvel para anunciar?
              </h2>
              <p className="mt-3 leading-7 text-blue-100/85">
                Acesse o painel para gerenciar os prédios e os imóveis cadastrados.
              </p>
            </div>
            <Link
              href="/admin/login"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-6 py-3.5 font-extrabold text-blue-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              Acessar painel →
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <Link href="/" className="text-lg font-extrabold text-slate-950">
            Imóveis<span className="text-blue-700"> Next</span>
          </Link>
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Imóveis Next. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </main>
  )
}
