package Testcases;

import java.util.Properties;
import javax.mail.*;
import javax.mail.internet.*;
public class SendEmail {

	public static void sendEmail(String result) {
        String to = "naveen@jupitermeta.io";
        String from = "rajesh@jupitermeta.io";
        final String username = "";
        final String password = "your_app_password"; 

        String host = "smtp.gmail.com";

        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", host);
        props.put("mail.smtp.port", "587");

        Session session = Session.getInstance(props,
          new javax.mail.Authenticator() {
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(username, password);
            }
          });

        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(from));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to));
            message.setSubject("Test Result: " + result);
            message.setText("The Selenium test result is: " + result);

            Transport.send(message);

            System.out.println("Email Sent Successfully");

        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }
	
}
