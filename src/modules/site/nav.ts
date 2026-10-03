/** Enlace del menú público (los enlaces se administran en Panel → Menú). */
export interface NavLink {
  href: string;
  label: string;
  newTab?: boolean;
}
