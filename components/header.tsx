import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-green-600">
          ESG Reporter
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="#overview" className="text-gray-600 hover:text-green-600">
                Overview
              </Link>
            </li>
            <li>
              <Link href="#report" className="text-gray-600 hover:text-green-600">
                Report
              </Link>
            </li>
            <li>
              <Button variant="outline">Login</Button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

