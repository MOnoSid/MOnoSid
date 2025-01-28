import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { MessageSquare } from "lucide-react";

const Feedback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    feedback: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("feedback")
        .insert([formData]);

      if (error) throw error;

      toast({
        title: "Thank you for your feedback!",
        description: "We appreciate your input.",
      });

      navigate("/");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-therapy-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="text-therapy-text-primary"
          >
            ← Back
          </Button>
          <h1 className="text-2xl font-semibold text-therapy-text-primary">Feedback</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-therapy-surface p-6 rounded-xl border border-therapy-border-light/10">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-therapy-text-primary">
              Name
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="bg-therapy-card border-therapy-border-light/10 text-therapy-text-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-therapy-text-primary">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              className="bg-therapy-card border-therapy-border-light/10 text-therapy-text-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="feedback" className="text-sm font-medium text-therapy-text-primary">
              Your Feedback
            </label>
            <Textarea
              id="feedback"
              value={formData.feedback}
              onChange={(e) => setFormData(prev => ({ ...prev, feedback: e.target.value }))}
              required
              className="min-h-[150px] bg-therapy-card border-therapy-border-light/10 text-therapy-text-primary"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-therapy-primary hover:bg-therapy-primary/90"
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Feedback;