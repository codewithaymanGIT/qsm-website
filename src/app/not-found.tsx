import Link from "next/link";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <section className="flex min-h-[70svh] items-center pt-28">
      <Container>
        <h1 className="text-h2 font-semibold">Page not found</h1>
        <p className="mt-5 max-w-lg text-lg text-mist">The page you are looking for does not exist or has moved.</p>
        <Link href="/" className="mt-8 inline-flex min-h-12 items-center bg-gold px-7 font-medium text-ink hover:bg-[#d8b679]">
          Go to the homepage
        </Link>
      </Container>
    </section>
  );
}
