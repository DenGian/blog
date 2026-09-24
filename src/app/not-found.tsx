import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { NotFoundContent } from "@/components/site/NotFoundContent";
export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main">
        <NotFoundContent />
      </main>
      <Footer />
    </>
  );
}
