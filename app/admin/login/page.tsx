
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

      if (loginError) {
        console.error('Erro de login Supabase:', {
          message: loginError.message,
          status: loginError.status,
          name: loginError.name,
        })

        setError(`Erro ${loginError.status ?? ''}: ${loginError.message}`)
        return
      }

      if (!data.session) {
        setError(
          'Login realizado sem sessão. Verifique a configuração de autenticação.'
        )
        return
      }

      router.replace('/admin')
      router.refresh()
    } catch (err) {
      console.error('Erro inesperado no login:', err)

      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível conectar ao Supabase.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"
      />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl shadow-black/30 md:grid-cols-2">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-800 via-blue-950 to-slate-950 p-10 text-white md:flex">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl"
          />

          <div className="relative">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-2xl font-black">
                I
              </span>
              <span className="text-xl font-extrabold tracking-tight">
                Imóveis<span className="text-blue-300"> Next</span>
              </span>
            </Link>

            <div className="mt-20">
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
                Área administrativa
              </span>

              <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight">
                Seu negócio imobiliário, organizado em um só lugar.
              </h1>

              <p className="mt-5 max-w-sm leading-7 text-blue-100/80">
                Gerencie prédios, cadastre apartamentos e mantenha seus anúncios
                organizados em um painel simples e intuitivo.
              </p>
            </div>
          </div>

          <div className="relative border-t border-white/15 pt-6 text-sm text-blue-100/70">
            Plataforma de gestão imobiliária
          </div>
        </section>

        <section className="flex items-center justify-center bg-white px-6 py-10 sm:px-10 md:px-9 lg:px-12">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-10 inline-flex items-center gap-3 md:hidden">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-950 text-xl font-black text-white shadow-md">
                I
              </span>
              <span className="text-xl font-extrabold tracking-tight text-slate-950">
                Imóveis<span className="text-blue-700"> Next</span>
              </span>
            </Link>

            <div className="mb-8">
              <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-700">
                Bem-vindo de volta
              </span>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                Acesse sua conta
              </h2>

              <p className="mt-3 leading-6 text-slate-500">
                Entre com seu e-mail e sua senha para acessar o painel.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  E-mail
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  autoComplete="email"
                  autoCapitalize="none"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Senha
                </label>

                <input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  autoComplete="current-password"
                  required
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="break-words rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
                >
                  <p className="font-bold">Não foi possível entrar</p>
                  <p className="mt-1">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-700 px-5 py-4 font-extrabold text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? 'Entrando...' : 'Entrar no painel →'}
              </button>
            </form>

            <div className="mt-7 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-600">
                Ainda não possui uma conta?
              </p>

              <Link
                href="/admin/cadastro"
                className="mt-2 inline-flex font-extrabold text-blue-700 transition hover:text-blue-900"
              >
                Criar minha conta →
              </Link>
            </div>

            <div className="mt-7 text-center">
              <Link
                href="/"
                className="text-sm font-semibold text-slate-500 transition hover:text-blue-700"
              >
                ← Voltar para o site
              </Link>
            </div>

            <p className="mt-8 text-center text-xs text-slate-400">
              Imóveis Next · Painel administrativo
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
