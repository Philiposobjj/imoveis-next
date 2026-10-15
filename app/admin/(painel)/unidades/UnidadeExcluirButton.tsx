"use client";

import { useState } from "react";

type Props = {
  id: string;
  action: (formData: FormData) => void | Promise<void>;
};

export default function UnidadeExcluirButton({ id, action }: Props) {
  const [confirmando, setConfirmando] = useState(false);

  return (
    <form
      action={action}
      onSubmit={(event) => {
        const confirmado = window.confirm(
          "Tem certeza que deseja excluir este imóvel? Essa ação não poderá ser desfeita."
        );

        if (!confirmado) {
          event.preventDefault();
          setConfirmando(false);
        } else {
          setConfirmando(true);
        }
      }}
    >
      <input type="hidden" name="id" value={id} />

      <button
        type="submit"
        disabled={confirmando}
        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
      >
        {confirmando ? "Excluindo..." : "Excluir"}
      </button>
    </form>
  );
}