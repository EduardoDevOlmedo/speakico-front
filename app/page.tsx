'use client';
import { Link } from "@heroui/link";
import { button as buttonStyles } from "@heroui/theme";
import { title, subtitle } from "@/components/primitives";
import Image from "next/image";
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation('common', { keyPrefix: '' });

  return (
    <main className="flex flex-col items-center justify-center px-4 py-30">
      <section className="text-center max-w-2xl space-y-6">
        <h1
          className={title({
            class:
              "text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white",
          })}
        >
          {t('home.title')}
          <br />
          {t('home.with')} <span className="text-violet-700 dark:text-violet-400">SpeaKico</span>
        </h1>
        <div className="flex justify-center m-4">
          <div className="relative">
            <Image src="/SpeaKico/KICO BIRD 2.png" alt="SpeaKico" width={100} height={100} className="relative z-10" />
            <Image src="/SpeaKico/alita.png" alt="Feather" width={100} height={100} className="absolute top-1 left-15 z-5 rotate-2 feather-animation" />
          </div>
        </div>
        <p
          className={subtitle({
            class:
              "text-lg md:text-xl text-zinc-700 dark:text-zinc-200",
          })}
        >
          {t('home.description')}
        </p>

        <div className="flex justify-center gap-4 pt-4">
          <Link
            href="/practice"
            className={buttonStyles({
              color: "primary",
              variant: "shadow",
              radius: "full",
              class:
                "px-6 py-3 text-white bg-violet-600 hover:bg-violet-500 transition-all",
            })}
          >
            {t('home.practice')}
          </Link>

          <Link
            href="/chat"
            className={buttonStyles({
              color: "default",
              variant: "bordered",
              radius: "full",
              class:
                "px-6 py-3 text-zinc-900 dark:text-white border-zinc-900 dark:border-white hover:border-teal-600 dark:hover:border-teal-300 transition-all",
            })}
          >
            {t('home.chatbot')}
          </Link>
        </div>
      </section>
    </main>
  );
}
