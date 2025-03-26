import { Button } from "@/components/ui/button"

export default function Hero() {
  return (
    <section className="bg-green-50 py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-green-800">Simplify Your ESG Reporting</h1>
        <p className="text-xl mb-8 text-gray-600 max-w-2xl mx-auto">
          Streamline your Environmental, Social, and Governance reporting process with our comprehensive tool designed
          for businesses of all sizes.
        </p>
        <Button size="lg" asChild>
          <a href="#report">Start Your ESG Report</a>
        </Button>
      </div>
    </section>
  )
}

