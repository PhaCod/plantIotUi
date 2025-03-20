"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  companyName: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  industry: z.string().min(2, {
    message: "Industry must be at least 2 characters.",
  }),
  carbonEmissions: z.string().refine((val) => !isNaN(Number.parseFloat(val)), {
    message: "Carbon emissions must be a number.",
  }),
  energyUsage: z.string().refine((val) => !isNaN(Number.parseFloat(val)), {
    message: "Energy usage must be a number.",
  }),
  wasteManagement: z.string(),
  employeePolicies: z.string(),
  communityInitiatives: z.string(),
  governanceStructure: z.string(),
})

export default function ESGForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      industry: "",
      carbonEmissions: "",
      energyUsage: "",
      wasteManagement: "",
      employeePolicies: "",
      communityInitiatives: "",
      governanceStructure: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "ESG Report Submitted",
        description: "Your ESG report has been successfully submitted.",
      })
      form.reset()
    }, 2000)
  }

  return (
    <section id="report" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center text-green-800">ESG Reporting Form</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your company name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your industry" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="carbonEmissions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carbon Emissions (metric tons CO2e)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your carbon emissions" {...field} />
                  </FormControl>
                  <FormDescription>Total greenhouse gas emissions in metric tons of CO2 equivalent.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="energyUsage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Energy Usage (MWh)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your energy usage" {...field} />
                  </FormControl>
                  <FormDescription>Total energy consumption in megawatt-hours.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="wasteManagement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Waste Management Practices</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your waste management practices"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employeePolicies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee Policies and Practices</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your employee policies and practices"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="communityInitiatives"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Community Initiatives</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your community initiatives" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="governanceStructure"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Governance Structure</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your governance structure" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit ESG Report"}
            </Button>
          </form>
        </Form>
      </div>
    </section>
  )
}

