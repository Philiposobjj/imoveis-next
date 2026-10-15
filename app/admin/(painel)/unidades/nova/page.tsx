
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Props = {
  searchParams: Promise<{ erro?: string }>;
};

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const labelClass = "text-sm font-semibold text-slate-700";

export default async function NovaUnidadePage({ searchParams }: Props) {
  const { erro } = await searchParams;
  const supabase = await createClient();

  const { data: predios, error } = await supabase
    .from("buildings")
    .select("id, name, city")
    .order("name");

  async function cadastrarUnidade(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const buildingId = String(formData.get("building_id") ?? "");
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const bedroomsValue = String(formData.get("bedrooms") ?? "");
    const bathroomsValue = String(formData.get("bathrooms") ?? "");
    const areaValue = String(formData.get("area_m2") ?? "");
    const floorValue = String(formData.get("floor") ?? "");
    const status = String(formData.get("status") ?? "disponivel");
    const tipoAnuncio = String(formData.get("tipo_anuncio") ?? "venda");
    const precoValue = String(formData.get("preco") ?? "").trim();
    const publicado = formData.get("publicado") === "on";

    if (!buildingId || !title) {
      redirect(
        "/admin/unidades/nova?erro=" +
          encodeURIComponent("Selecione o prédio e informe o título.")
      );
    }

    if (!["venda", "aluguel", "temporada"].includes(tipoAnuncio)) {
      redirect(
        "/admin/unidades/nova?erro=" +
          encodeURIComponent("Selecione um tipo de anúncio válido.")
      );
    }

    if (
      !["disponivel", "reservado", "ocupado", "indisponivel"].includes(status)
    ) {
      redirect(
        "/admin/unidades/nova?erro=" +
          encodeURIComponent("Selecione um status válido para a unidade.")
      );
    }

    let preco: number | null = null;

    if (precoValue) {
      const normalizado = precoValue.includes(",")
        ? precoValue.replace(/\./g, "").replace(",", ".")
        : precoValue;

      preco = Number(normalizado);

      if (!Number.isFinite(preco) || preco <= 0) {
        redirect(
          "/admin/unidades/nova?erro=" +
            encodeURIComponent("Informe um preço válido e maior que zero.")
        );
      }
    }

    if (publicado && preco === null) {
      redirect(
        "/admin/unidades/nova?erro=" +
          encodeURIComponent("Informe o preço antes de publicar o anúncio.")
      );
    }

    const arquivos = formData
      .getAll("fotos")
      .filter((item): item is File => item instanceof File && item.size > 0);

    if (arquivos.length > 10) {
      redirect(
        "/admin/unidades/nova?erro=" +
          encodeURIComponent("Você pode enviar no máximo 10 fotos.")
      );
    }

    for (const arquivo of arquivos) {
      if (!arquivo.type.startsWith("image/")) {
        redirect(
          "/admin/unidades/nova?erro=" +
            encodeURIComponent("Envie somente arquivos de imagem.")
        );
      }

      if (arquivo.size > 5 * 1024 * 1024) {
        redirect(
          "/admin/unidades/nova?erro=" +
            encodeURIComponent(
              `A foto "${arquivo.name}" ultrapassa o limite de 5 MB.`
            )
        );
      }
    }

    const caminhosFotos: string[] = [];

    for (const arquivo of arquivos) {
      const nomeSeguro = arquivo.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const caminho = `${buildingId}/${crypto.randomUUID()}-${nomeSeguro}`;

      const { error: uploadError } = await supabase.storage
        .from("fotos")
        .upload(caminho, arquivo, {
          contentType: arquivo.type,
          upsert: false,
        });

      if (uploadError) {
        redirect(
          "/admin/unidades/nova?erro=" +
            encodeURIComponent(
              `Falha ao enviar a foto "${arquivo.name}": ${uploadError.message}`
            )
        );
      }

      caminhosFotos.push(caminho);
    }

    const { error: insertError } = await supabase.from("units").insert({
      building_id: buildingId,
      title,
      description: description || null,
      bedrooms: bedroomsValue ? Number(bedroomsValue) : null,
      bathrooms: bathroomsValue ? Number(bathroomsValue) : null,
      area_m2: areaValue ? Number(areaValue) : null,
      floor: floorValue ? Number(floorValue) : null,
      status,
      fotos: caminhosFotos,
      tipo_anuncio: tipoAnuncio,
      preco,
      publicado,
      status_comercial: "disponivel",
    });

    if (insertError) {
      redirect(
        "/admin/unidades/nova?erro=" +
          encodeURIComponent(
            `Não foi possível cadastrar a unidade: ${insertError.message}`
          )
      );
    }

    redirect("/admin/unidades");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin/unidades"
          className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-500 transition hover:text-blue-700"
        >
          <span aria-hidden="true">←</span>
          Voltar para unidades
        </Link>

        <section className="relative mt-5 overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-blue-800 px-6 py-8 text-white shadow-lg sm:px-9 sm:py-10">
          <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="absolute -bottom-20 right-1/3 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-100">
              Administração de imóveis
            </span>

            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Cadastrar imóvel
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
              Cadastre as características da unidade, defina o tipo de anúncio
              e adicione fotos para apresentar melhor o imóvel.
            </p>
          </div>
        </section>

        {erro && (
          <div
            role="alert"
            className="mt-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <span className="text-lg" aria-hidden="true">
              !
            </span>
            <div>
              <p className="font-semibold">Não foi possível continuar</p>
              <p className="mt-1">{erro}</p>
            </div>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <p className="font-semibold">Erro ao carregar os prédios</p>
            <p className="mt-1">{error.message}</p>
          </div>
        )}

        {!error && (!predios || predios.length === 0) && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            <p className="font-semibold">Nenhum prédio cadastrado</p>
            <p className="mt-1">
              Antes de cadastrar uma unidade, você precisa ter pelo menos um
              prédio no sistema.
            </p>
            <Link
              href="/admin/predios/novo"
              className="mt-4 inline-flex rounded-xl bg-amber-600 px-4 py-2.5 font-semibold text-white transition hover:bg-amber-700"
            >
              Cadastrar prédio
            </Link>
          </div>
        )}

        <form action={cadastrarUnidade} className="mt-6 space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xl">
                🏢
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Identificação do imóvel
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Escolha o prédio e informe o título da unidade.
                </p>
              </div>
            </div>

            <div className="grid gap-5">
              <div>
                <label htmlFor="building_id" className={labelClass}>
                  Prédio <span className="text-red-500">*</span>
                </label>
                <select
                  id="building_id"
                  name="building_id"
                  required
                  defaultValue=""
                  disabled={!predios?.length}
                  className={inputClass}
                >
                  <option value="" disabled>
                    Selecione um prédio
                  </option>
                  {predios?.map((predio) => (
                    <option key={predio.id} value={predio.id}>
                      {predio.name}
                      {predio.city ? ` — ${predio.city}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="title" className={labelClass}>
                  Título do imóvel <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  maxLength={150}
                  placeholder="Ex.: Apartamento 301 com varanda"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="description" className={labelClass}>
                  Descrição do imóvel
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  placeholder="Descreva os diferenciais, a localização e as características do imóvel..."
                  className={`${inputClass} resize-y`}
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
                💰
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Dados do anúncio
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Configure a modalidade, o preço e a publicação.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="tipo_anuncio" className={labelClass}>
                  Tipo de anúncio <span className="text-red-500">*</span>
                </label>
                <select
                  id="tipo_anuncio"
                  name="tipo_anuncio"
                  defaultValue="venda"
                  required
                  className={inputClass}
                >
                  <option value="venda">Venda</option>
                  <option value="aluguel">Aluguel</option>
                  <option value="temporada">Aluguel por temporada</option>
                </select>
              </div>

              <div>
                <label htmlFor="preco" className={labelClass}>
                  Preço (R$)
                </label>
                <input
                  id="preco"
                  name="preco"
                  type="text"
                  inputMode="decimal"
                  placeholder="Ex.: 350.000,00"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              <p className="font-semibold text-slate-800">
                Como informar o preço
              </p>
              <p className="mt-1">
                Na venda, informe o valor total. No aluguel, informe o valor
                mensal. Na temporada, informe o valor que pretende anunciar.
                Você pode usar formatos como 350000,00 ou 350.000,00.
              </p>
            </div>

            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 transition hover:bg-blue-50">
              <input
                type="checkbox"
                name="publicado"
                className="mt-1 h-4 w-4 accent-blue-600"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-900">
                  Publicar anúncio imediatamente
                </span>
                <span className="mt-1 block text-sm leading-5 text-slate-600">
                  O anúncio será marcado como publicado. Para aparecer no site,
                  a página pública também precisa considerar o campo
                  &quot;publicado&quot;.
                </span>
              </span>
            </label>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-xl">
                📐
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Características
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Informe os detalhes físicos da unidade.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="bedrooms" className={labelClass}>
                  Quartos
                </label>
                <input
                  id="bedrooms"
                  name="bedrooms"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Ex.: 3"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="bathrooms" className={labelClass}>
                  Banheiros
                </label>
                <input
                  id="bathrooms"
                  name="bathrooms"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Ex.: 2"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="area_m2" className={labelClass}>
                  Área (m²)
                </label>
                <input
                  id="area_m2"
                  name="area_m2"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Ex.: 85.50"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="floor" className={labelClass}>
                  Andar
                </label>
                <input
                  id="floor"
                  name="floor"
                  type="number"
                  step="1"
                  placeholder="Ex.: 3"
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="status" className={labelClass}>
                  Status da unidade
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue="disponivel"
                  className={inputClass}
                >
                  <option value="disponivel">Disponível</option>
                  <option value="reservado">Reservado</option>
                  <option value="ocupado">Ocupado</option>
                  <option value="indisponivel">Indisponível</option>
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-xl">
                📷
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Fotos do imóvel
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Adicione imagens para valorizar o anúncio.
                </p>
              </div>
            </div>

            <label htmlFor="fotos" className={labelClass}>
              Selecionar imagens
            </label>
            <input
              id="fotos"
              name="fotos"
              type="file"
              accept="image/*"
              multiple
              className={`${inputClass} file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700`}
            />

            <p className="mt-3 text-sm leading-5 text-slate-500">
              Você pode selecionar até 10 imagens, com no máximo 5 MB por
              arquivo. Formatos de imagem são aceitos.
            </p>
          </section>

          <div className="flex flex-col-reverse gap-3 pb-8 sm:flex-row sm:justify-end">
            <Link
              href="/admin/unidades"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={!predios?.length || Boolean(error)}
              className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cadastrar imóvel
              <span className="ml-2" aria-hidden="true">
                →
              </span>
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
