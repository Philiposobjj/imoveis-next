
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

type Predio = {
  name: string;
  city: string | null;
  address: string | null;
};

type Unidade = {
  id: string;
  title: string | null;
  description: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_m2: number | null;
  status: string | null;
  status_comercial: string | null;
  tipo_anuncio: string | null;
  preco: number | null;
  publicado: boolean;
  fotos: string[] | null;
  buildings: Predio | Predio[] | null;
};

function formatarPreco(preco: number, tipo: string) {
  const valor = preco.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  });

  if (tipo === "aluguel") return `${valor}/mês`;
  if (tipo === "temporada") return `${valor}/diária`;

  return valor;
}

function nomeTipoAnuncio(tipo: string | null) {
  if (tipo === "aluguel") return "Para alugar";
  if (tipo === "temporada") return "Temporada";

  return "À venda";
}

export default async function Home() {
  const supabase = await createClient();

  const { data: unidades, error } = await supabase
    .from("units")
    .select(`
      id,
      title,
      description,
      bedrooms,
      bathrooms,
      area_m2,
      status,
      status_comercial,
      tipo_anuncio,
      preco,
      publicado,
      fotos,
      buildings (
        name,
        city,
        address
      )
    `)
    .order("created_at", { ascending: false });

  const imoveis = (unidades ?? []) as Unidade[];

  const publicadas = imoveis.filter((unidade) => {
    const status = unidade.status?.trim().toLowerCase();
    const comercial = unidade.status_comercial?.trim().toLowerCase();

    return (
      unidade.publicado === true &&
      ["disponivel", "disponível"].includes(status ?? "") &&
      ["disponivel", "disponível"].includes(comercial ?? "")
    );
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-950 text-2xl font-black text-white shadow-lg shadow-blue-900/20">
              I
            </span>

            <span>
              <span className="block text-xl font-extrabold tracking-tight text-slate-950">
                Imóveis Next
              </span>
              <span className="mt-0.5 block text-xs font-medium text-slate-500">
                Seu próximo imóvel começa aqui
              </span>
            </span>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/imoveis"
              className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 sm:inline-flex"
            >
              Explorar imóveis
            </Link>

            <Link
              href="/admin/login"
              className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 sm:px-5"
            >
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Encontre seu lugar
            </span>

            <h1 className="mt-6 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              O próximo capítulo da sua vida começa{" "}
              <span className="text-blue-300">em um novo endereço.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              Explore imóveis para comprar, alugar ou aproveitar por
              temporada. Compare características, confira preços e encontre
              o lugar ideal para você.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium text-blue-100">
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">
                Compra e venda
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">
                Aluguel
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">
                Temporada
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur sm:p-5">
            <div className="rounded-2xl bg-white p-5 sm:p-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                  Busca de imóveis
                </p>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                  Onde você quer morar?
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Comece pela localização e pelo tipo de negócio.
                </p>
              </div>

              <form action="/imoveis" method="GET" className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor="busca"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Cidade ou bairro
                  </label>
                  <input
                    id="busca"
                    type="text"
                    name="busca"
                    placeholder="Ex.: Florianópolis, Centro..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="tipo"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    O que você procura?
                  </label>
                  <select
                    id="tipo"
                    name="tipo"
                    defaultValue="comprar"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="comprar">Comprar um imóvel</option>
                    <option value="alugar">Alugar um imóvel</option>
                    <option value="temporada">Temporada</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-4 font-bold text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800"
                >
                  Buscar imóveis
                  <span aria-hidden="true">→</span>
                </button>
              </form>

              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
                <span className="text-emerald-600">✓</span>
                Consulte anúncios e características dos imóveis
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              Nossa seleção
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Imóveis anunciados
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Encontre opções para diferentes momentos e necessidades.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
              <span className="text-blue-700">{publicadas.length}</span>{" "}
              {publicadas.length === 1 ? "anúncio disponível" : "anúncios disponíveis"}
            </span>

            <Link
              href="/imoveis"
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800 transition hover:bg-blue-100"
            >
              Ver todos
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {error ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-white p-6 text-red-700 shadow-sm">
            <h3 className="font-bold">Não foi possível carregar os imóveis.</h3>
            <p className="mt-2 text-sm">{error.message}</p>
          </div>
        ) : publicadas.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
              ⌂
            </span>
            <h3 className="mt-5 text-xl font-extrabold text-slate-900">
              Novos imóveis em breve
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              Ainda não há anúncios publicados. Assim que houver imóveis
              disponíveis, eles aparecerão nesta página.
            </p>
            <Link
              href="/imoveis"
              className="mt-6 inline-flex rounded-xl bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800"
            >
              Explorar imóveis
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {publicadas.map((unidade) => {
              const predio = Array.isArray(unidade.buildings)
                ? unidade.buildings[0]
                : unidade.buildings;

              const foto = unidade.fotos?.find(
                (item) => typeof item === "string" && item.trim() !== ""
              );

              const fotoUrl = foto
                ? foto.startsWith("http://") || foto.startsWith("https://")
                  ? foto
                  : supabase.storage.from("fotos").getPublicUrl(foto).data.publicUrl
                : null;

              const tipo = unidade.tipo_anuncio ?? "venda";

              const detalhes = [
                unidade.bedrooms != null
                  ? `${unidade.bedrooms} quarto(s)`
                  : null,
                unidade.bathrooms != null
                  ? `${unidade.bathrooms} banheiro(s)`
                  : null,
                unidade.area_m2 != null
                  ? `${unidade.area_m2} m²`
                  : null,
              ].filter(Boolean);

              const localizacao =
                predio?.city || predio?.address || "Localização não informada";

              return (
                <article
                  key={unidade.id}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/10"
                >
                  <Link
                    href={`/imoveis/${unidade.id}`}
                    className="relative block h-60 overflow-hidden bg-slate-100"
                  >
                    {fotoUrl ? (
                      <Image
                        src={fotoUrl}
                        alt={unidade.title || "Foto do imóvel"}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50">
                        <span className="text-5xl">⌂</span>
                        <p className="mt-3 text-sm font-medium text-slate-500">
                          Foto não cadastrada
                        </p>
                      </div>
                    )}

                    <span className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-xs font-bold text-blue-800 shadow-sm">
                      {nomeTipoAnuncio(tipo)}
                    </span>
                  </Link>

                  <div className="p-5 sm:p-6">
                    <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <span aria-hidden="true" className="text-blue-700">
                        ⌖
                      </span>
                      <span className="line-clamp-1">{localizacao}</span>
                    </p>

                    <h3 className="mt-3 line-clamp-2 min-h-14 break-words text-xl font-extrabold leading-7 text-slate-950">
                      {unidade.title?.trim() || "Imóvel sem título"}
                    </h3>

                    <p className="mt-3 text-2xl font-extrabold tracking-tight text-blue-800">
                      {unidade.preco != null
                        ? formatarPreco(Number(unidade.preco), tipo)
                        : "Consulte o preço"}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-y border-slate-100 py-4 text-xs font-medium text-slate-600">
                      {detalhes.length > 0 ? (
                        detalhes.map((detalhe) => (
                          <span key={detalhe} className="inline-flex items-center gap-1.5">
                            <span className="text-blue-700">✓</span>
                            {detalhe}
                          </span>
                        ))
                      ) : (
                        <span>Características não informadas</span>
                      )}
                    </div>

                    <p className="mt-4 line-clamp-3 min-h-[3.75rem] break-words text-sm leading-6 text-slate-500">
                      {unidade.description?.trim() ||
                        "Entre em contato para saber mais sobre este imóvel."}
                    </p>

                    <Link
                      href={`/imoveis/${unidade.id}`}
                      className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-blue-800"
                    >
                      Ver detalhes do imóvel
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-7 sm:flex-row sm:items-center sm:p-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Encontre sua próxima oportunidade
            </span>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              Seu próximo imóvel pode estar aqui.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
              Explore os anúncios e encontre uma opção que combine com
              seus planos.
            </p>
          </div>

          <Link
            href="/imoveis"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-4 font-bold text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800"
          >
            Explorar imóveis
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-7 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Link href="/" className="font-extrabold text-slate-800">
            Imóveis Next
          </Link>

          <p>Encontre seu próximo imóvel.</p>

          <Link
            href="/admin/login"
            className="font-semibold text-blue-700 transition hover:text-blue-900"
          >
            Acesso administrativo
          </Link>
        </div>
      </footer>
    </main>
  );
}
