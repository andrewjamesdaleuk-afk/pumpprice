const nodemailer = require('nodemailer');

// ==========================================
// 1. ADD YOUR EMAIL CREDENTIALS HERE
// If using Gmail, you MUST use an "App Password" (2FA must be on), not your normal password.
// Google Account -> Security -> 2-Step Verification -> App Passwords
// ==========================================
const SENDER_EMAIL = 'YOUR_EMAIL@gmail.com'; 
const SENDER_PASSWORD = 'YOUR_APP_PASSWORD'; 

// Set up the SMTP transport (Defaults to Gmail, change if using Outlook/Yahoo)
const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: SENDER_EMAIL,
    pass: SENDER_PASSWORD
  }
});

// The PR Contact List
const targets = [
  { pub: 'MEN', email: 'newsdesk@men-news.co.uk', region: 'Greater Manchester' },
  { pub: 'Birmingham Live', email: 'newsdesk@birminghammail.co.uk', region: 'Birmingham' },
  { pub: 'Liverpool Echo', email: 'news@liverpool.com', region: 'Merseyside' },
  { pub: 'Yorkshire Post', email: 'newsdesk@yorkshirepost.co.uk', region: 'Yorkshire' },
  { pub: 'Leeds Live', email: 'leeds.live@reachplc.com', region: 'Leeds' },
  { pub: 'Sheffield Star', email: 'news@thestar.co.uk', region: 'Sheffield' },
  { pub: 'Chronicle Live', email: 'ec.news@ncjmedia.co.uk', region: 'Newcastle' },
  { pub: 'Teesside Live', email: 'news@gazettemedia.co.uk', region: 'Teesside' },
  { pub: 'Daily Record', email: 'reporters@dailyrecord.co.uk', region: 'Scotland' },
  { pub: 'Glasgow Live', email: 'news@glasgowlive.co.uk', region: 'Glasgow' },
  { pub: 'Wales Online', email: 'newsdesk@walesonline.co.uk', region: 'Wales' },
  { pub: 'MyLondon', email: 'mylondonnewsdesk@reachplc.com', region: 'London' },
  { pub: 'Evening Standard', email: 'news@standard.co.uk', region: 'London' },
  { pub: 'Bristol Live', email: 'bristolpostnews@localworld.co.uk', region: 'Bristol' },
  { pub: 'Kent Live', email: 'kentlivenewsdesk@reachplc.com', region: 'Kent' }
];

async function sendPitches() {
  console.log(`Starting automated PR blast to ${targets.length} news desks...`);
  
  for (const target of targets) {
    const subject = `The free tool exposing the ${target.region} fuel price "postcode lottery"`;
    
    const textBody = `Hi ${target.pub} News Desk,

With fuel prices fluctuating wildly, the CMA recently forced supermarkets to publish their live pump prices. However, nobody built a tool to let drivers actually check those prices along their specific commute to find the cheapest option.

I recently built Pumpprice.live (https://pumpprice.live) to solve this. It's a completely free, ad-free map tool that uses the live government data to highlight the cheapest supermarket fuel directly on a driver's route.

Crucially, it exposes the massive "postcode lottery" happening right now across ${target.region}, where drivers are being charged significantly different prices for petrol by the exact same supermarkets just a few miles apart depending on which borough they live in.

I thought your readers might find this genuinely useful as a way to save a few quid during the cost of living crisis this week.

Best regards,
[YOUR NAME]
Creator, Pumpprice.live`;

    try {
      // Send the email
      await transporter.sendMail({
        from: `"Pumpprice.live" <${SENDER_EMAIL}>`,
        to: target.email,
        subject: subject,
        text: textBody,
      });
      console.log(`✅ Sent to ${target.pub} (${target.email})`);
      
      // Wait 5 seconds between emails to avoid tripping Gmail spam rate-limits
      await new Promise(resolve => setTimeout(resolve, 5000));
      
    } catch (error) {
      console.error(`❌ Failed to send to ${target.email}:`, error.message);
    }
  }
  
  console.log('🎉 PR Campaign Finished!');
}

// Run it
if (SENDER_EMAIL === 'YOUR_EMAIL@gmail.com') {
  console.log("⚠️ PLEASE EDIT THIS FILE FIRST: Add your email, app password, and name at the top of the file.");
} else {
  sendPitches();
}
