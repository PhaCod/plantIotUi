import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Users, Building2 } from "lucide-react"

const esgPillars = [
  {
    title: "Environmental",
    description:
      "Measure and report your company's impact on the environment, including carbon emissions, energy usage, and waste management.",
    icon: Leaf,
  },
  {
    title: "Social",
    description:
      "Evaluate your company's relationships with employees, suppliers, customers, and communities, including labor practices and product safety.",
    icon: Users,
  },
  {
    title: "Governance",
    description: "Assess your company's leadership, executive pay, audits, internal controls, and shareholder rights.",
    icon: Building2,
  },
]

export default function ESGOverview() {
  return (
    <section id="overview" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center text-green-800">ESG Reporting Overview</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {esgPillars.map((pillar, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <pillar.icon className="w-6 h-6 text-green-600" />
                  {pillar.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{pillar.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

