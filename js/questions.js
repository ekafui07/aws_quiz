/**
 * questions.js
 * Default AWS VPC question bank.
 * Each question follows the shape: { q, options, answer (0-based index), explanation }
 */

const DEFAULT_QUESTIONS = [
    {
        q: "Which AWS service allows you to provision a logically isolated section of the AWS Cloud where you can launch AWS resources in a virtual network that you define?",
        options: ["Amazon Route 53", "AWS Direct Connect", "Amazon Virtual Private Cloud (VPC)", "Amazon CloudFront"],
        answer: 2,
        explanation: "Amazon VPC lets you provision a logically isolated section of the AWS Cloud."
    },
    {
        q: "True or False: A single subnet can span across multiple Availability Zones (AZs).",
        options: ["True", "False"],
        answer: 1,
        explanation: "False. A subnet must reside entirely within ONE Availability Zone."
    },
    {
        q: "You are deploying the frontend of your Kakos Audit Tool and want it to be accessible from the internet. Which component must be attached to your VPC?",
        options: ["NAT Gateway", "Internet Gateway", "Virtual Private Gateway", "Transit Gateway"],
        answer: 1,
        explanation: "An Internet Gateway (IGW) allows two-way communication between instances in your VPC and the internet."
    },
    {
        q: "Which component acts as a 'stateless' virtual firewall for your entire Subnet?",
        options: ["Network ACL", "Security Group", "IAM Policy", "VPC Flow Logs"],
        answer: 0,
        explanation: "Network ACLs (NACLs) act at the subnet level and are stateless."
    }
];
