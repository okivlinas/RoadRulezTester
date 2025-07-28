
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAppSelector } from "@/store";

// Красивый градиентный фон на главной:
const heroBg =
  "bg-gradient-to-br from-[#E5DEFF] via-[#D3E4FD] to-[#fff] dark:from-[#1A1F2C] dark:via-[#6E59A5] dark:to-[#333]";

export default function IndexPage() {
  const { user } = useAppSelector(state => state.auth);

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Hero Section */}
      <section
        className={`${heroBg} py-24 flex items-center justify-center animate-fade-in`}
        style={{
          backgroundAttachment: "fixed",
        }}
      >
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gradient-primary drop-shadow-lg">
             Тестирование ПДД 
            <span className="inline-block animate-bounce">🚗</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 font-medium drop-shadow-sm">
            Тренируйтесь на&nbsp;реальных вопросах и повышайте свои шансы на&nbsp;успех в&nbsp;ГИБДД!
          </p>
          <Button
            asChild
            size="lg"
            className="px-8 py-4 shadow-lg bg-gradient-to-r from-primary to-accent hover:scale-105 transition-transform duration-200 text-lg"
          >
            <Link to="/quiz">
              Начать тренировку
              <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
        {/* Легкая анимация градиентных кругов */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute left-[-64px] top-[-64px] w-72 h-72 bg-gradient-to-br from-[#9b87f5]/40 to-[#FDE1D3]/40 rounded-full filter blur-2xl opacity-60 animate-fade-in" />
          <div className="absolute right-[-80px] bottom-[-40px] w-96 h-96 bg-gradient-to-tr from-[#D3E4FD]/40 to-[#8B5CF6]/30 rounded-full blur-3xl opacity-60 animate-fade-in" />
        </div>
      </section>

      {/* Ключевые возможности */}
      <section className="container mx-auto py-16 px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Ключевые возможности
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature Card 1 */}
          <Link to="/quiz" className="group focus:outline-none">
            <div className="bg-white/90 dark:bg-[#272143] rounded-3xl shadow-xl p-8 border border-muted transition-all duration-200 group-hover:scale-105 group-hover:border-primary cursor-pointer h-full glass animate-fade-in">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6 mx-auto">
                <span className="text-primary text-4xl">📚</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">Обучающие тесты</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Большая база вопросов, тематические и экзаменационные режимы.
              </p>
            </div>
          </Link>

          {/* Feature Card 2 */}
          <Link to="/statistics" className="group focus:outline-none">
            <div className="bg-white/90 dark:bg-[#272143] rounded-3xl shadow-xl p-8 border border-muted transition-all duration-200 group-hover:scale-105 group-hover:border-primary cursor-pointer h-full glass animate-fade-in">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-accent/10 mb-6 mx-auto">
                <span className="text-accent text-4xl">📊</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">Статистика и прогресс</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Личная статистика, <br /> прогресс и достижения.
              </p>
            </div>
          </Link>

          {/* Feature Card 3 */}
          <Link to="/profile" className="group focus:outline-none">
            <div className="bg-white/90 dark:bg-[#272143] rounded-3xl shadow-xl p-8 border border-muted transition-all duration-200 group-hover:scale-105 group-hover:border-primary cursor-pointer h-full glass animate-fade-in">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-secondary/10 mb-6 mx-auto">
                <span className="text-secondary text-4xl">👤</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">Пользовательский профиль</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Редактируйте данные, <br /> просматривайте историю попыток.
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-muted to-white/90 py-8 text-center border-t border-muted mt-auto">
        <p className="text-sm text-muted-foreground drop-shadow-sm">
          &copy; {new Date().getFullYear()} Kivlinas Oleg
        </p>
      </footer>
    </div>
  );
}
