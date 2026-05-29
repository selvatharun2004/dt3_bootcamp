import { ReactNode } from "react";

export default function Card(props: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="card">
      <div className="card__head">
        <div>
          <div className="card__title">{props.title}</div>
          {props.subtitle ? <div className="card__subtitle">{props.subtitle}</div> : null}
        </div>
        {props.right ? <div className="card__right">{props.right}</div> : null}
      </div>
      <div className="card__body">{props.children}</div>
    </section>
  );
}
