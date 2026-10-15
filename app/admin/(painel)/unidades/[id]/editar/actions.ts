

"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function atualizarUnidade(formData: FormData) {
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  const bedroomsValue = String(formData.get("bedrooms") ?? "").trim();
  const bathroomsValue = String(formData.get("bathrooms") ?? "").trim();
  const floorValue = String(formData.get("floor") ?? "").trim();
  const areaValue = String(formData.get("area_m2") ?? "").trim();

  if (!id || !title || !status) {
    redirect(
      `/admin/unidades/${encodeURIComponent(id)}/editar?erro=campos`
    );
  }

  const bedrooms = bedroomsValue === "" ? null : Number(bedroomsValue);
  const bathrooms = bathroomsValue === "" ? null : Number(bathroomsValue);
  const floor = floorValue === "" ? null : Number(floorValue);
  const area_m2 = areaValue === "" ? null : Number(areaValue);

  const numeros = [bedrooms, bathrooms, floor, area_m2];

  if (
    numeros.some(
      (valor) => valor !== null && !Number.isFinite(valor)
    ) ||
    (bedrooms !== null && bedrooms < 0) ||
    (bathrooms !== null && bathrooms < 0) ||
    (area_m2 !== null && area_m2 < 0)
  ) {
    redirect(
      `/admin/unidades/${encodeURIComponent(id)}/editar?erro=valores`
    );
  }

  const { data: unidade, error: buscaError } = await supabase
    .from("units")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (buscaError || !unidade) {
    redirect("/admin/unidades?erro=unidade");
  }

  const { error } = await supabase
    .from("units")
    .update({
      title,
      description: description || null,
      bedrooms,
      bathrooms,
      floor,
      area_m2,
      status,
    })
    .eq("id", id);

  if (error) {
    console.error("Erro ao atualizar unidade:", error.message);

    redirect(
      `/admin/unidades/${encodeURIComponent(id)}/editar?erro=salvar`
    );
  }

  redirect("/admin/unidades?sucesso=atualizada");
}
