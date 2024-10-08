import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Questions() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>What tasks can the chatbot perform?</AccordionTrigger>
        <AccordionContent>
          The chatbot can assist with customer support, provide information, manage reminders, and engage in conversation.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How does the chatbot handle user queries?</AccordionTrigger>
        <AccordionContent>
          The chatbot uses natural language processing to understand and respond to user queries effectively.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is the chatbot available 24/7?</AccordionTrigger>
        <AccordionContent>
          Yes, the chatbot is available 24/7 to assist users at any time.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
