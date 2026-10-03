import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/modules/auth/schemas";
import { createDonationSchema } from "@/modules/donations/schemas";
import { projectSchema } from "@/modules/projects/schemas";

describe("auth schemas", () => {
  it("normaliza el correo del login", () => {
    expect(loginSchema.parse({ email: " Ana@Hadassa.ORG ", password: "x" }).email).toBe("ana@hadassa.org");
  });

  it("exige que las contraseñas coincidan", () => {
    const r = registerSchema.safeParse({
      fullName: "Ana Pérez",
      email: "ana@hadassa.org",
      phone: "70000000",
      password: "Clave1234",
      confirmPassword: "Otra1234",
    });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].path).toEqual(["confirmPassword"]);
  });

  it("exige contraseñas con letras y números", () => {
    const r = registerSchema.safeParse({
      fullName: "Ana Pérez",
      email: "ana@hadassa.org",
      phone: "70000000",
      password: "solamenteletras",
      confirmPassword: "solamenteletras",
    });
    expect(r.success).toBe(false);
  });
});

describe("createDonationSchema", () => {
  it("convierte el monto y limpia campos vacíos del formulario", () => {
    const d = createDonationSchema.parse({ amount: "150.5", method: "QR", projectId: "", reference: "" });
    expect(d.amount).toBe(150.5);
    expect(d.projectId).toBeUndefined();
    expect(d.reference).toBeUndefined();
  });

  it("rechaza montos no positivos", () => {
    expect(createDonationSchema.safeParse({ amount: "0" }).success).toBe(false);
  });
});

describe("projectSchema", () => {
  it("interpreta checkboxes y meta vacía", () => {
    const p = projectSchema.parse({ name: "Casa de Fruto", color: "#E3AAAA", goal: "", featured: "on" });
    expect(p.featured).toBe(true);
    expect(p.isActive).toBe(false);
    expect(p.goal).toBeNull();
  });
});
