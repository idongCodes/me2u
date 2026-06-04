import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Preview,
} from '@react-email/components';
import * as React from 'react';

interface ContactFormEmailProps {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export const ContactFormEmail = ({
  name,
  email,
  phone,
  subject,
  message,
}: ContactFormEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>New Contact Form Submission from {name}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={headerText}>New Contact Submission</Heading>
          </Section>
          <Section style={content}>
            <Text style={label}>Name</Text>
            <Text style={value}>{name || "Not provided"}</Text>
            
            <Text style={label}>Email</Text>
            <Text style={value}>{email || "Not provided"}</Text>
            
            <Text style={label}>Phone</Text>
            <Text style={value}>{phone || "Not provided"}</Text>
            
            <Text style={label}>Subject</Text>
            <Text style={value}>{subject || "Not provided"}</Text>
            
            <Hr style={hr} />
            
            <Text style={label}>Message</Text>
            <Text style={messageValue}>{message || "Not provided"}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0 0 48px',
  marginBottom: '64px',
  border: '1px solid #e6ebf1',
  borderRadius: '8px',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
  maxWidth: '500px',
  overflow: 'hidden',
};

const header = {
  padding: '0 48px',
  backgroundColor: '#0ea5e9', // Sky blue
  paddingTop: '24px',
  paddingBottom: '24px',
};

const headerText = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '0',
};

const content = {
  padding: '32px 48px 0',
};

const label = {
  fontSize: '12px',
  color: '#8898aa',
  fontWeight: 'bold',
  textTransform: 'uppercase' as const,
  margin: '0 0 4px',
};

const value = {
  fontSize: '16px',
  color: '#333333',
  margin: '0 0 24px',
};

const messageValue = {
  fontSize: '16px',
  color: '#333333',
  margin: '0 0 24px',
  whiteSpace: 'pre-wrap' as const,
  backgroundColor: '#f9f9f9',
  padding: '16px',
  borderRadius: '4px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '24px 0',
};

export default ContactFormEmail;
