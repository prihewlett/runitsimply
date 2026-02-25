interface AddressLinkProps {
  address: string;
  className?: string;
}

export function AddressLink({ address, className }: AddressLinkProps) {
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`underline decoration-blue-300 underline-offset-2 hover:text-blue-600 hover:decoration-blue-600 ${className ?? ""}`}
      title="Open in Google Maps"
    >
      {address}
    </a>
  );
}
