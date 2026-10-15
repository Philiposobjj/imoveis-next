# 🏡 Imóveis Next

### Plataforma imobiliária moderna desenvolvida com Next.js e Supabase

O **Imóveis Next** é uma aplicação web para divulgação e gerenciamento de imóveis, desenvolvida com foco em uma experiência de navegação intuitiva, organização de informações e administração de propriedades.

A plataforma permite organizar prédios e unidades imobiliárias, disponibilizar informações detalhadas sobre os imóveis e gerenciar os cadastros por meio de um painel administrativo.

---

## ✨ Funcionalidades

- 🏢 **Gestão de prédios:** cadastro, visualização e edição de informações dos empreendimentos.
- 🏠 **Gestão de unidades:** gerenciamento de apartamentos e imóveis, com informações como quartos, banheiros, metragem, andar e preço.
- 🖼️ **Fotos dos imóveis:** suporte ao envio e armazenamento de imagens.
- 🔎 **Consulta de imóveis:** páginas para explorar os imóveis e visualizar seus detalhes.
- 🔐 **Autenticação:** páginas de login, cadastro e confirmação de autenticação.
- 🛠️ **Painel administrativo:** interface dedicada ao gerenciamento dos dados.
- 📱 **Interface responsiva:** desenvolvimento voltado à utilização em diferentes tamanhos de tela.
- ☁️ **Integração com Supabase:** banco de dados, autenticação e armazenamento de arquivos.

## 🖥️ Tecnologias utilizadas

| Tecnologia | Aplicação |
|---|---|
| [Next.js](https://nextjs.org/) | Framework web e renderização de páginas |
| [React](https://react.dev/) | Construção da interface |
| [TypeScript](https://www.typescriptlang.org/) | Tipagem estática e organização do código |
| [Supabase](https://supabase.com/) | Banco de dados, autenticação e armazenamento |
| [Tailwind CSS](https://tailwindcss.com/) | Estilização da interface |
| [Git](https://git-scm.com/) | Controle de versão |
| [GitHub](https://github.com/) | Hospedagem do código-fonte |

## 📂 Estrutura do projeto

```text
imoveis-next/
├── app/
│   ├── admin/
│   │   ├── (painel)/
│   │   │   ├── predios/
│   │   │   └── unidades/
│   │   ├── cadastro/
│   │   └── login/
│   ├── auth/
│   ├── imoveis/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   └── supabase/
│       ├── client.ts
│       └── server.ts
├── public/
├── .gitignore
├── package.json
└── README.md
```

## ⚙️ Como executar localmente

### Pré-requisitos

- Node.js compatível com a versão do Next.js utilizada no projeto.
- npm.
- Uma conta no Supabase.
- As credenciais de acesso ao projeto Supabase.

### 1. Clone o repositório

```bash
git clone https://github.com/Philiposobjj/imoveis-next.git
```

### 2. Entre na pasta

```bash
cd imoveis-next
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto e configure as variáveis utilizadas pela integração com o Supabase.

Exemplo, caso esses sejam os nomes utilizados nos arquivos de configuração:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_publica_do_supabase
```

Use os valores correspondentes ao seu projeto e confira os nomes exatos das variáveis em `lib/supabase/client.ts` e `lib/supabase/server.ts`.

**Importante:** nunca publique arquivos `.env`, senhas ou chaves privadas no GitHub. O arquivo de ambiente deve permanecer protegido pelo `.gitignore`.

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse no navegador:

http://localhost:3000

### 6. Gere a versão de produção

```bash
npm run build
```

Esse comando verifica a compilação da aplicação para produção.

## 🗄️ Banco de dados e armazenamento

O projeto utiliza o Supabase para persistência de dados e recursos de backend.

Entre as entidades utilizadas estão:

- **Buildings:** informações dos prédios e empreendimentos.
- **Units:** informações das unidades imobiliárias.
- **Storage:** armazenamento de imagens dos imóveis.

As permissões de acesso devem ser configuradas de acordo com as funcionalidades da aplicação, utilizando políticas de segurança adequadas no Supabase.

## 🚀 Deploy

O projeto pode ser publicado na [Vercel](https://vercel.com/), plataforma integrada ao ecossistema Next.js.

O processo de implantação inclui:

1. Importar o repositório do GitHub.
2. Configurar as variáveis de ambiente.
3. Executar a compilação de produção.
4. Publicar a aplicação e configurar o domínio.
5. Ajustar as URLs de redirecionamento da autenticação no Supabase.

## 🎯 Objetivo do projeto

O Imóveis Next foi desenvolvido como um projeto prático de desenvolvimento web, reunindo interface, autenticação, persistência de dados, gerenciamento administrativo e integração com serviços externos.

O objetivo é oferecer uma base organizada e extensível para uma plataforma imobiliária, permitindo futuras melhorias de pesquisa, filtros, localização, apresentação de fotos e experiência do usuário.

## 👨‍💻 Desenvolvedor

**Philip Alves Carmichael**

Desenvolvedor de Sistemas com interesse em desenvolvimento web, integração de APIs, bancos de dados e construção de aplicações completas.

- **GitHub:** [@Philiposobjj](https://github.com/Philiposobjj)
- **Repositório:** [imoveis-next](https://github.com/Philiposobjj/imoveis-next)

---

*Desenvolvido com Next.js, TypeScript e Supabase.*
