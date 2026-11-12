import { WhatsappLogo } from '@phosphor-icons/react/dist/ssr';
import { site } from '@/lib/catalogue';

/** The WhatsApp float the source site carried, kept as the fastest route to a human. */
export function WhatsAppFloat() {
  const text = encodeURIComponent(
    'Hello Beauty Art Lights, I would like to enquire about your decorative lighting range.',
  );

  return (
    <a
      className="wa-float"
      href={`https://wa.me/${site.whatsappNumber}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Message Beauty Art Lights on WhatsApp"
    >
      <WhatsappLogo size={19} weight="fill" aria-hidden="true" />
    </a>
  );
}
