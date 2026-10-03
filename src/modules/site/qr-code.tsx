"use client";

import { QRCodeSVG } from "qrcode.react";

export function QrCode({ value, size = 220 }: { value: string; size?: number }) {
  return <QRCodeSVG value={value} size={size} level="M" fgColor="#2f2a33" bgColor="transparent" className="h-auto w-full" title="Código QR referencial" />;
}
