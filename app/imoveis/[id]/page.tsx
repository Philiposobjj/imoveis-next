
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
};

type Predio = {
  name?: string | null;
  city?: string | null;
  address?: string | null;
  description?: string | null;
};

function obterUrlFoto(foto: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  if (/^https?:\/\//i.test(foto)) return foto;

  const caminho = foto
    .replace(/^\/+/, "")
    .replace(/^storage\/v1\/object\/public\/fotos\//, "")
    .replace(/^fotos\//, "");

  return supabase.storage.from("fotos").getPublicUrl(caminho).data.publicUrl;
}

export default async function DetalhesImovelPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: unidade, error } = await supabase
    .from("units")
    .select(`
      id,
      title,
      description,
      bedrooms,
      bathrooms,
      area_m2,
      floor,
      status,
      status_comercial,
      tipo_anuncio,
      preco,
      publicado,
      fotos,
      buildings (
        name,
        city,
        address,
        description
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Erro ao carregar imóvel: ${error.message}`);
  }

  if (!unidade) {
    notFound();
  }

  const predio: Predio | null = Array.isArray(unidade.buildings)
    ? unidade.buildings[0] ?? null
    : unidade.buildings ?? null;

  const tipo = unidade.tipo_anuncio ?? "venda";

  const tipoLabel =
    tipo === "aluguel"
      ? "Para alugar"
      : tipo === "temporada"
        ? "Temporada"
        : "À venda";

  const preco =
    unidade.preco != null && Number.isFinite(Number(unidade.preco))
      ? Number(unidade.preco).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })
      : null;

  const complementoPreco =
    tipo === "aluguel"
      ? "/mês"
      : tipo === "temporada"
        ? "/diária"
        : "";

  const fotos: string[] = Array.isArray(unidade.fotos)
    ? unidade.fotos
        .map((foto: unknown) => {
          if (typeof foto === "string") return foto.trim();

          if (foto && typeof foto === "object") {
            const objeto = foto as Record<string, unknown>;
            const valor = objeto.url ?? objeto.publicUrl ?? objeto.public_url ?? objeto.path;
            return typeof valor === "string" ? valor.trim() : "";
          }

          return "";
        })
        .filter((foto: string) => foto.length > 0)
    : [];

  const fotosComUrl = fotos.map((foto) => ({
    caminho: foto,
    url: obterUrlFoto(foto, supabase),
  }));

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-950 text-xl font-black text-white shadow-md">
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

          <Link
            href="/imoveis"
            className="inline-flex items-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
          >
            ← Ver imóveis
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-7 sm:py-10">
        <nav className="mb-7 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="transition hover:text-blue-700">
            Início
          </Link>
          <span>/</span>
          <Link href="/imoveis" className="transition hover:text-blue-700">
            Imóveis
          </Link>
          <span>/</span>
          <span className="font-medium text-slate-800">Detalhes</span>
        </nav>

        <section className="mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1.5 text-sm font-extrabold text-blue-800">
              {tipoLabel}
            </span>
            <span className="text-sm text-slate-500">
              Ref. {unidade.id}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
            {unidade.title || "Imóvel sem título"}
          </h1>

          <p className="mt-4 flex items-start gap-2 leading-6 text-slate-600">
            <span className="font-bold text-blue-700" aria-hidden="true">⌖</span>
            <span>
              {predio?.name ? `${predio.name} · ` : ""}
              {[predio?.address, predio?.city].filter(Boolean).join(", ") ||
                "Localização não informada"}
            </span>
          </p>
        </section>

        {fotosComUrl.length > 0 ? (
          <section
            aria-label="Fotos do imóvel"
            className="grid gap-3 overflow-hidden rounded-3xl md:grid-cols-2"
          >
            <div className="relative h-72 overflow-hidden rounded-2xl bg-slate-200 sm:h-96 md:h-[490px]">
              <Image
                src={fotosComUrl[0].url}
                alt={`Foto principal de ${unidade.title ?? "imóvel"}`}
                fill
                priority
                unoptimized
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition duration-500 hover:scale-[1.02]"
              />
              <span className="absolute bottom-4 left-4 rounded-xl border border-white/20 bg-slate-950/75 px-3 py-2 text-sm font-bold text-white backdrop-blur">
                Foto principal
              </span>
            </div>

            {fotosComUrl.length > 1 ? (
              <div className="grid grid-cols-2 gap-3 md:grid-rows-2">
                {fotosComUrl.slice(1, 5).map((foto, index) => (
                  <div
                    key={`${foto.caminho}-${index}`}
                    className="relative h-36 overflow-hidden rounded-2xl bg-slate-200 sm:h-48 md:h-auto"
                  >
                    <Image
                      src={foto.url}
                      alt={`Foto ${index + 2} de ${unidade.title ?? "imóvel"}`}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition duration-500 hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="hidden items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center md:flex">
                <div>
                  <span className="text-5xl" aria-hidden="true">⌂</span>
                  <p className="mt-3 font-bold text-slate-800">
                    Seu próximo endereço
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Mais fotos poderão ser adicionadas ao anúncio.
                  </p>
                </div>
              </div>
            )}
          </section>
        ) : (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-5xl text-blue-800" aria-hidden="true">
              ⌂
            </span>
            <p className="mt-5 text-xl font-extrabold text-slate-900">
              Fotos em breve
            </p>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Ainda não há fotos cadastradas para este imóvel.
            </p>
          </div>
        )}

        <div className="mt-8 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">
                  Informações
                </span>
                <h2 className="mt-2 text-xl font-black text-slate-950">
                  Características do imóvel
                </h2>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: "▤", label: "Quartos", value: unidade.bedrooms ?? "—" },
                  { icon: "◉", label: "Banheiros", value: unidade.bathrooms ?? "—" },
                  {
                    icon: "↔",
                    label: "Área",
                    value: unidade.area_m2 != null ? `${unidade.area_m2} m²` : "—",
                  },
                  { icon: "⌂", label: "Andar", value: unidade.floor ?? "—" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-blue-100 hover:bg-blue-50/50"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl font-bold text-blue-800 shadow-sm">
                      {item.icon}
                    </span>
                    <p className="mt-4 text-sm text-slate-500">{item.label}</p>
                    <p className="mt-1 text-xl font-black text-slate-950">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
              <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">
                Conheça o imóvel
              </span>
              <h2 className="mt-2 text-xl font-black text-slate-950">
                Sobre o imóvel
              </h2>
              <p className="mt-4 whitespace-pre-line leading-8 text-slate-600">
                {unidade.description?.trim() ||
                  "Mais informações sobre este imóvel serão disponibilizadas em breve."}
              </p>
            </section>

            {predio && (
              <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
                <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">
                  Empreendimento
                </span>
                <h2 className="mt-2 text-xl font-black text-slate-950">
                  Sobre o prédio
                </h2>

                {predio.name && (
                  <p className="mt-4 text-lg font-bold text-slate-800">
                    {predio.name}
                  </p>
                )}

                {predio.address && (
                  <p className="mt-3 flex items-start gap-2 text-slate-600">
                    <span className="text-blue-700" aria-hidden="true">⌖</span>
                    <span>{predio.address}</span>
                  </p>
                )}

                {predio.city && (
                  <p className="mt-2 text-slate-600">{predio.city}</p>
                )}

                {predio.description && (
                  <p className="mt-4 whitespace-pre-line leading-7 text-slate-600">
                    {predio.description}
                  </p>
                )}
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-24">
            <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-lg shadow-slate-900/5">
              <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 p-6 text-white">
                <p className="text-sm font-semibold text-blue-100">
                  {tipoLabel}
                </p>

                <p className="mt-3 break-words text-3xl font-black tracking-tight sm:text-4xl">
                  {preco ?? "Consulte o preço"}
                </p>

                {preco && complementoPreco && (
                  <p className="mt-1 text-sm text-blue-100">
                    {complementoPreco}
                  </p>
                )}
              </div>

              <div className="p-6">
                <h2 className="text-lg font-extrabold text-slate-950">
                  Gostou deste imóvel?
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Explore outros anúncios e encontre a opção ideal para você.
                </p>

                <Link
                  href="/imoveis"
                  className="mt-5 block rounded-xl bg-blue-700 px-5 py-3.5 text-center font-extrabold text-white shadow-md shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
                >
                  Ver outros imóveis →
                </Link>

                <div className="my-6 border-t border-slate-200" />

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-bold text-slate-800">
                    Informações importantes
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Confirme com o responsável pelo anúncio os valores, a disponibilidade e eventuais despesas de condomínio.
                  </p>
                </div>

                <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                  Valores e informações sujeitos à confirmação.
                </p>
              </div>
            </section>
          </aside>
        </div>

        <footer className="mt-12 border-t border-slate-200 py-8">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <Link href="/" className="text-lg font-extrabold text-slate-950">
              Imóveis<span className="text-blue-700"> Next</span>
            </Link>
            <Link
              href="/imoveis"
              className="text-sm font-bold text-blue-700 transition hover:text-blue-900"
            >
              ← Explorar todos os imóveis
            </Link>
          </div>
          <p className="mt-4 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} Imóveis Next. Todos os direitos reservados.
          </p>
        </footer>
      </div>
    </main>
  );
}
