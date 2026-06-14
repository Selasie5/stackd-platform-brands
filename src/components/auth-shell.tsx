import * as React from 'react'
import { Link } from '@tanstack/react-router'

interface AuthShellProps {
  title: string
  subtitle?: string
  topRightText?: string
  topRightLinkText?: string
  topRightLinkTo?: string
  bannerText?: string | null
  backButton?: React.ReactNode
  children: React.ReactNode
}

export function AuthShell({
  title,
  subtitle,
  topRightText,
  topRightLinkText,
  topRightLinkTo = '/',
  bannerText,
  backButton,
  children,
}: AuthShellProps) {
  return (
    <div
      className="min-h-screen w-full relative flex items-center justify-center md:justify-end p-0 md:p-3 lg:p-4 bg-cover bg-center"
      style={{
        backgroundImage: "url('/auth-bg.jpg')"
      }}
    >
      <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />

      <div className="relative z-10 w-full max-w-[580px] bg-white dark:bg-zinc-950 rounded-none md:rounded-[18px] shadow-sm flex flex-col justify-between min-h-screen md:min-h-[calc(100vh-24px)] lg:min-h-[calc(100vh-32px)] overflow-hidden">


        {bannerText && (
          <div className="w-full bg-[#E2F7C2] dark:bg-lime-950 text-lime-900 dark:text-lime-200 text-xs py-3 px-6 text-center font-medium border-b border-lime-200 dark:border-lime-900">
            {bannerText}
          </div>
        )}

        <div className="p-8 md:p-12 flex flex-col flex-1 justify-between">

          <header className="flex items-center justify-between w-full mb-10">
            <div className="flex items-center">

              {backButton ? (
                <div className="">
                  {backButton}
                </div>
              ) : (
                <img src="/favicon.svg" alt="Spleenet Logo" className="w-10 h-10" />
              )}
            </div>
            {topRightLinkText && (
              <div className="text-sm font-medium">
                {topRightText && <span className="text-zinc-400 mr-1.5">{topRightText}</span>}
                <Link
                  to={topRightLinkTo}
                  className="text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-300 underline underline-offset-4 font-semibold transition-colors"
                >
                  {topRightLinkText}
                </Link>
              </div>
            )}
          </header>




          <main className="flex-1 flex flex-col justify-center w-full my-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-3 tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h1>
              {subtitle && (
                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed max-w-md mx-auto">
                  {subtitle}
                </p>
              )}
            </div>

            {children}
          </main>


          <footer className="flex items-center justify-between w-full mt-10 text-xs font-medium text-zinc-400">
            <p>© Copyright {new Date().getFullYear()}</p>
            <div className="flex items-center space-x-6">
              <Link to="/" className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Privacy Policy</Link>
              <Link to="/" className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Support</Link>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
