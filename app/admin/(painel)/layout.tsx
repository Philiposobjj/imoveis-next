
import { ReactNode } from "react"
import Link from "next/link"
import SairButton from "./SairButton"

export default function PainelLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 text-xl font-black text-white shadow-lg shadow-blue-900/20 transition hover:scale-105"
              aria-label="Página inicial do painel"
            >
              I
            </Link>

            <div>
              <Link
                href="/admin"
                className="text-xl font-extrabold tracking-tight text-slate-900 transition hover:text-blue-700"
              >
                Imóveis
              </Link>

              <p className="mt-0.5 text-xs font-medium text-slate-500">
                Painel administrativo
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <span aria-hidden="true">⌂</span>
              Início
            </Link>

            <Link
              href="/admin/predios"
              className="inline-flex items-center gap-2 rounded-xl border border-blue-700 bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-700/20 transition hover:border-blue-800 hover:bg-blue-800"
            >
              <span aria-hidden="true">▦</span>
              Prédios
            </Link>

            <div className="ml-auto sm:ml-1">
              <SairButton />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto min-h-[calc(100vh-100px)] max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span className="font-semibold text-slate-600">
            Imóveis · Painel administrativo
          </span>
          <span>Gestão simples e organizada dos seus imóveis.</span>
        </div>
      </footer>
    </div>
  )
}
