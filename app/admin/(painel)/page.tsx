
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();

  const [
    { count: totalPredios },
    { count: totalUnidades },
    { count: unidadesDisponiveis },
  ] = await Promise.all([
    supabase
      .from("buildings")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("units")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("units")
      .select("*", { count: "exact", head: true })
      .or("status.ilike.%disponível%,status.ilike.%disponivel%,status.ilike.%available%"),
  ]);

  const cards = [
    {
      titulo: "Prédios cadastrados",
      valor: totalPredios ?? 0,
      descricao: "Empreendimentos no sistema",
      simbolo: "▦",
      cor: "bg-blue-50 text-blue-700",
      href: "/admin/predios",
      acao: "Gerenciar prédios",
    },
    {
      titulo: "Imóveis cadastrados",
      valor: totalUnidades ?? 0,
      descricao: "Unidades registradas",
      simbolo: "⌂",
      cor: "bg-indigo-50 text-indigo-700",
      href: "/admin/unidades",
      acao: "Gerenciar imóveis",
    },
    {
      titulo: "Imóveis disponíveis",
      valor: unidadesDisponiveis ?? 0,
      descricao: "Marcados como disponíveis",
      simbolo: "✓",
      cor: "bg-emerald-50 text-emerald-700",
      href: "/admin/unidades",
      acao: "Ver disponibilidade",
    },
  ];

  return (
    <main className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 p-7 text-white shadow-xl sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="relative max-w-2xl">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
            Painel administrativo
          </span>

          <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Bem-vindo ao Imóveis!
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
            Gerencie seus prédios e apartamentos em um só lugar.
            Consulte os cadastros e mantenha as informações dos imóveis
            organizadas.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/admin/predios"
              className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 font-bold text-blue-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              Gerenciar prédios →
            </Link>

            <Link
              href="/admin/unidades"
              className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/10 px-5 py-3 font-bold text-white transition hover:bg-white/20"
            >
              Ver imóveis
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5">
          <h2 className="text-xl font-extrabold text-slate-900">
            Visão geral
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Resumo dos cadastros do seu sistema.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <article
              key={card.titulo}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">
                  {card.titulo}
                </span>

                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl font-bold ${card.cor}`}
                >
                  {card.simbolo}
                </span>
              </div>

              <p className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900">
                {card.valor}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                {card.descricao}
              </p>

              <Link
                href={card.href}
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-700 transition hover:text-blue-900"
              >
                {card.acao}
                <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">
            Acesso rápido
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Escolha o que deseja administrar.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link
            href="/admin/predios"
            className="group flex items-center gap-4 rounded-2xl border border-slate-200 p-5 transition hover:border-blue-300 hover:bg-blue-50/50"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-800">
              ▦
            </span>
            <span className="flex-1">
              <span className="block font-bold text-slate-900">
                Prédios
              </span>
              <span className="mt-1 block text-sm text-slate-500">
                Cadastrar e editar empreendimentos
              </span>
            </span>
            <span className="text-lg text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700">
              →
            </span>
          </Link>

          <Link
            href="/admin/unidades"
            className="group flex items-center gap-4 rounded-2xl border border-slate-200 p-5 transition hover:border-blue-300 hover:bg-blue-50/50"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-xl text-indigo-800">
              ⌂
            </span>
            <span className="flex-1">
              <span className="block font-bold text-slate-900">
                Imóveis e apartamentos
              </span>
              <span className="mt-1 block text-sm text-slate-500">
                Cadastrar, consultar e editar unidades
              </span>
            </span>
            <span className="text-lg text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700">
              →
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
