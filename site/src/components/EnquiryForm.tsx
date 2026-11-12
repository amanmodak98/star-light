'use client';

import { useMemo, useState } from 'react';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr';
import type { Design, Finish } from '@/lib/site';
import { EMAIL, WHATSAPP_NUMBER } from '@/lib/site';

type Draft = {
  name: string;
  email: string;
  phone: string;
  company: string;
  country: string;
  quantity: string;
  message: string;
};

const EMPTY: Draft = {
  name: '',
  email: '',
  phone: '',
  company: '',
  country: '',
  quantity: '',
  message: '',
};

const line = (label: string, value: string) => (value ? `${label}: ${value}` : '');

function buildBody(design: Design, finish: Finish, d: Draft): string {
  const lines = [
    'Hello Beauty Art Lights,',
    '',
    'I would like a quote for the following.',
    '',
    line('Product', design.name),
    line('Finish', finish.finish),
    line('Product code', finish.sku),
    line('Range', design.categoryLabel),
    line('Quantity', d.quantity),
    '',
    line('Name', d.name),
    line('Email', d.email),
    line('Phone / WhatsApp', d.phone),
    line('Company', d.company),
    line('Country', d.country),
    '',
    d.message ? `Message:\n${d.message}` : '',
    '',
    'Please include pricing, minimum order quantity, lead time, carton details and any certification marks for this item.',
  ];
  // Empty optional fields leave gaps; collapse runs of blank lines.
  return lines.filter((l) => l !== undefined && l !== '').join('\n');
}

function mailtoLink(design: Design, finish: Finish, d: Draft): string {
  const subject = `Enquiry: ${design.name}, ${finish.finish}, ${finish.sku}`;
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildBody(design, finish, d))}`;
}

function whatsappLink(design: Design, finish: Finish, d: Draft): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildBody(design, finish, d))}`;
}

/**
 * The site's only conversion path. There is no backend and no third-party form
 * service: the enquiry leaves as an email to the sales address or as a WhatsApp
 * message, both built in the browser from what the visitor typed. That works on
 * any host, forever, and cannot silently stop delivering.
 */
export function EnquiryForm({ design, finish }: { design: Design; finish: Finish }) {
  const [draft, setDraft] = useState<Draft>(EMPTY);

  const set = (key: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setDraft((d) => ({ ...d, [key]: e.target.value }));

  const mailto = useMemo(() => mailtoLink(design, finish, draft), [design, finish, draft]);
  const whatsapp = useMemo(() => whatsappLink(design, finish, draft), [design, finish, draft]);

  const ready = draft.name.trim().length > 0 && draft.email.trim().length > 0;

  return (
    <div>
      <div className="form-grid">
        <div className="field">
          <label className="field__label" htmlFor="enq-name">
            Your name
          </label>
          <input
            id="enq-name"
            className="input"
            value={draft.name}
            onChange={set('name')}
            autoComplete="name"
            required
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="enq-email">
            Email
          </label>
          <input
            id="enq-email"
            className="input"
            type="email"
            value={draft.email}
            onChange={set('email')}
            autoComplete="email"
            required
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="enq-phone">
            Phone / WhatsApp <span>optional</span>
          </label>
          <input
            id="enq-phone"
            className="input"
            value={draft.phone}
            onChange={set('phone')}
            autoComplete="tel"
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="enq-quantity">
            Quantity <span>optional</span>
          </label>
          <input
            id="enq-quantity"
            className="input"
            value={draft.quantity}
            onChange={set('quantity')}
            placeholder="e.g. 100"
            inputMode="numeric"
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="enq-company">
            Company <span>optional</span>
          </label>
          <input
            id="enq-company"
            className="input"
            value={draft.company}
            onChange={set('company')}
            autoComplete="organization"
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="enq-country">
            Country <span>optional</span>
          </label>
          <input
            id="enq-country"
            className="input"
            value={draft.country}
            onChange={set('country')}
            autoComplete="country-name"
          />
        </div>

        <div className="field field--wide">
          <label className="field__label" htmlFor="enq-message">
            Message <span>optional</span>
          </label>
          <textarea
            id="enq-message"
            className="textarea"
            value={draft.message}
            onChange={set('message')}
            placeholder="Tell us what you need: finish, packaging, destination, or a drawing to build from."
          />
        </div>
      </div>

      <div className="send-options">
        <a
          className={`btn ${ready ? 'btn--brass' : 'btn--secondary'}`}
          href={mailto}
          aria-disabled={!ready}
          onClick={(e) => {
            if (!ready) e.preventDefault();
          }}
        >
          Send by email
          <span className="btn__icon">
            <ArrowUpRight size={13} weight="light" aria-hidden="true" />
          </span>
        </a>

        <a
          className={`btn ${ready ? 'btn--secondary' : 'btn--secondary'}`}
          href={whatsapp}
          aria-disabled={!ready}
          onClick={(e) => {
            if (!ready) e.preventDefault();
          }}
        >
          Send on WhatsApp
        </a>

        <p className="send-options__note" role="status" aria-live="polite">
          {ready
            ? 'Opens your mail app or WhatsApp with the details filled in.'
            : 'Add your name and email to enable sending.'}
        </p>
      </div>

      <noscript>
        <p className="send-options__note" style={{ marginTop: '1rem' }}>
          Email {EMAIL} or message +91 133 235 1546 on WhatsApp, quoting{' '}
          {finish.sku}.
        </p>
      </noscript>
    </div>
  );
}

/**
 * The general enquiry — used on the contact page, where there is no product to
 * quote for. Same two delivery routes, same construction.
 */
export function GeneralEnquiryForm() {
  const [draft, setDraft] = useState<Draft>(EMPTY);

  const set = (key: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setDraft((d) => ({ ...d, [key]: e.target.value }));

  const body = [
    'Hello Beauty Art Lights,',
    '',
    draft.message ? draft.message : 'I would like to enquire about your decorative lighting range.',
    '',
    line('Name', draft.name),
    line('Email', draft.email),
    line('Phone / WhatsApp', draft.phone),
    line('Company', draft.company),
    line('Country', draft.country),
    line('Quantity', draft.quantity),
    '',
    'Please include pricing, minimum order quantity, lead time and certification details.',
  ]
    .filter((l) => l !== undefined && l !== '')
    .join('\n');

  const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent('Enquiry: Beauty Art Lights')}&body=${encodeURIComponent(body)}`;
  const whatsapp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(body)}`;
  const ready = draft.name.trim().length > 0 && draft.email.trim().length > 0;

  return (
    <div>
      <div className="form-grid">
        <div className="field">
          <label className="field__label" htmlFor="c-name">
            Your name
          </label>
          <input id="c-name" className="input" value={draft.name} onChange={set('name')} autoComplete="name" required />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="c-email">
            Email
          </label>
          <input
            id="c-email"
            className="input"
            type="email"
            value={draft.email}
            onChange={set('email')}
            autoComplete="email"
            required
          />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="c-phone">
            Phone / WhatsApp <span>optional</span>
          </label>
          <input id="c-phone" className="input" value={draft.phone} onChange={set('phone')} autoComplete="tel" />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="c-quantity">
            Quantity <span>optional</span>
          </label>
          <input id="c-quantity" className="input" value={draft.quantity} onChange={set('quantity')} inputMode="numeric" />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="c-company">
            Company <span>optional</span>
          </label>
          <input
            id="c-company"
            className="input"
            value={draft.company}
            onChange={set('company')}
            autoComplete="organization"
          />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="c-country">
            Country <span>optional</span>
          </label>
          <input
            id="c-country"
            className="input"
            value={draft.country}
            onChange={set('country')}
            autoComplete="country-name"
          />
        </div>
        <div className="field field--wide">
          <label className="field__label" htmlFor="c-message">
            What are you looking for?
          </label>
          <textarea
            id="c-message"
            className="textarea"
            value={draft.message}
            onChange={set('message')}
            placeholder="A fixture and a quantity, a drawing to build from, or a question about the range."
          />
        </div>
      </div>

      <div className="send-options">
        <a
          className={`btn ${ready ? 'btn--brass' : 'btn--secondary'}`}
          href={mailto}
          aria-disabled={!ready}
          onClick={(e) => {
            if (!ready) e.preventDefault();
          }}
        >
          Send by email
          <span className="btn__icon">
            <ArrowUpRight size={13} weight="light" aria-hidden="true" />
          </span>
        </a>
        <a
          className="btn btn--secondary"
          href={whatsapp}
          aria-disabled={!ready}
          onClick={(e) => {
            if (!ready) e.preventDefault();
          }}
        >
          Send on WhatsApp
        </a>
        <p className="send-options__note" role="status" aria-live="polite">
          {ready
            ? 'Opens your mail app or WhatsApp with the details filled in.'
            : 'Add your name and email to enable sending.'}
        </p>
      </div>
    </div>
  );
}
