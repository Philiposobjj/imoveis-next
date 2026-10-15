
"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function CadastroPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleCadastro(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setSuccess("")

    if (password !== confirmPassword) {
      setError("As senhas não são iguais.")
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.")
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      const { error: cadastroError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
          },
        },
      })

      if (cadastroError) {
        setError(cadastroError.message)
        return
      }

      setSuccess(
        "Cadastro realizado com sucesso! Verifique seu e-mail, se solicitado, e depois entre na sua conta."
      )

      setTimeout(() => {
        router.push("/admin/login")
        router.refresh()
      }, 2000)
    } catch (err) {
      console.error("Erro ao cadastrar usuário:", err)

      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível realizar o cadastro. Tente novamente."
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
                Comece agora
              </span>

              <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight">
                Organize seus imóveis em um só lugar.
              </h1>

              <p className="mt-5 max-w-sm leading-7 text-blue-100/80">
                Crie sua conta para acessar o sistema e gerenciar seus prédios,
                apartamentos e anúncios imobiliários.
              </p>
            </div>
          </div>

          <div className="relative border-t border-white/15 pt-6 text-sm text-blue-100/70">
            Imóveis Next · Gestão imobiliária
          </div>
        </section>

        <section className="flex items-center justify-center bg-white px-6 py-10 sm:px-10 md:px-9 lg:px-12">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-3 md:hidden"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-950 text-xl font-black text-white shadow-md">
                I
              </span>

              <span className="text-xl font-extrabold tracking-tight text-slate-950">
                Imóveis<span className="text-blue-700"> Next</span>
              </span>
            </Link>

            <div className="mb-7">
              <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-700">
                Cadastro de usuário
              </span>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                Criar minha conta
              </h2>

              <p className="mt-3 leading-6 text-slate-500">
                Preencha os dados abaixo para começar.
              </p>
            </div>

            <form onSubmit={handleCadastro} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Nome completo
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  autoComplete="name"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  autoCapitalize="none"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Confirmar senha
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite a senha novamente"
                  autoComplete="new-password"
                  minLength={6}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="break-words rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
                >
                  <p className="font-bold">Não foi possível cadastrar</p>
                  <p className="mt-1">{error}</p>
                </div>
              )}

              {success && (
                <div
                  role="status"
                  className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800"
                >
                  <p className="font-bold">Cadastro realizado!</p>
                  <p className="mt-1">{success}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || Boolean(success)}
                className="w-full rounded-xl bg-blue-700 px-5 py-4 font-extrabold text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading
                  ? "Criando conta..."
                  : success
                    ? "Cadastro concluído"
                    : "Criar conta →"}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-600">
                Já possui uma conta?
              </p>

              <Link
                href="/admin/login"
                className="mt-2 inline-flex font-extrabold text-blue-700 transition hover:text-blue-900"
              >
                Entrar no sistema →
              </Link>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-sm font-semibold text-slate-500 transition hover:text-blue-700"
              >
                ← Voltar para o site
              </Link>
            </div>

            <p className="mt-7 text-center text-xs text-slate-400">
              Imóveis Next · Painel administrativo
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
