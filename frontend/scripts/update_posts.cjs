const fs = require('fs');

let content = fs.readFileSync('Pumpprice/frontend/src/content/posts.ts', 'utf8');

// E10 vs E5 Petrol
content = content.replace(
  'For everyone else, E10 is the clear winner for your wallet.</p>',
  'For everyone else, E10 is the clear winner for your wallet. Before filling up, always check <strong>Pumpprice.live</strong> to find the cheapest E10 prices on your specific route.</p>'
);

// Understanding Fuel Price Fluctuations
content = content.replace(
  'This is why using a fuel price comparison tool is essential to find the retailers passing on savings quickly.</p>',
  'This is why using a real-time comparison tool like <strong>Pumpprice.live</strong> is essential to find the retailers passing on savings quickly.</p>'
);

// Boost Your Fuel Economy
content = content.replace(
  'By implementing these simple changes, you can stretch your fuel further and keep more money in your pocket.</p>',
  'By implementing these simple changes, you can stretch your fuel further. And when you do need to fill up, using <strong>Pumpprice.live</strong> guarantees you won\'t overpay.</p>'
);

// Anatomy of UK Fuel Prices
content = content.replace(
  'the heavy burden of fixed taxation dampens the effect.</p>',
  'the heavy burden of fixed taxation dampens the effect. Because margins are the only variable, using <strong>Pumpprice.live</strong> to compare local stations is your best defense against high prices.</p>'
);

// Global Conflicts
content = content.replace(
  'making them one of the most volatile and frustrating factors influencing the cost of driving.</p>',
  'making them one of the most volatile and frustrating factors influencing the cost of driving. During times of high volatility, tracking real-time local drops on <strong>Pumpprice.live</strong> is crucial.</p>'
);

// Hypermiling
content = content.replace(
  'commute can easily boost your fuel economy by 10-20%.</p>',
  'commute can easily boost your fuel economy by 10-20%. Combine those hypermiling habits with the routing data from <strong>Pumpprice.live</strong> to maximize your savings.</p>'
);

// Supermarket vs. Premium
content = content.replace(
  'premium branded fuel (or using standard fuel and adding a bottle of quality fuel cleaner every few thousand miles) can be beneficial for long-term engine health.</p>',
  'premium branded fuel (or using standard fuel and adding a bottle of quality fuel cleaner every few thousand miles) can be beneficial for long-term engine health. Whichever you choose, check <strong>Pumpprice.live</strong> first to make sure you aren\'t overpaying.</p>'
);

// Diesel vs Petrol
content = content.replace(
  'ensure any diesel you consider is Euro 6 compliant to avoid these crippling hidden costs.</p>',
  'ensure any diesel you consider is Euro 6 compliant to avoid these crippling hidden costs. And whether you drive petrol or diesel, always map your route with <strong>Pumpprice.live</strong> to find the cheapest pumps.</p>'
);

// EV Charging vs Petrol
content = content.replace(
  'diesel may be more economical in the short term.</p>',
  'diesel may be more economical in the short term. If you are sticking with a combustion engine, a tool like <strong>Pumpprice.live</strong> will help you keep those running costs as low as possible.</p>'
);

// Do Aftermarket Fuel Additives Actually Work
content = content.replace(
  'Maintaining your car properly is always the best additive.</p>',
  'Maintaining your car properly is always the best additive. Save the money you would have spent on "miracle" boosters, and use <strong>Pumpprice.live</strong> to find genuinely cheaper fuel instead.</p>'
);

// The Fuel Duty Freeze
content = content.replace(
  'forcing a major rethink of how motoring is taxed in the future.</p>',
  'forcing a major rethink of how motoring is taxed in the future. Until then, motorists must rely on real-time data platforms like <strong>Pumpprice.live</strong> to navigate the volatile wholesale market.</p>'
);

// The Best Apps to Find Cheap Fuel
content = content.replace(
  'The smartest way to save money is to check the prices before you leave the house using a dedicated fuel price app.</p>',
  'The smartest way to save money is to check the prices before you leave the house. While there are many apps out there, we built <strong>Pumpprice.live</strong> specifically to solve the problem of finding cheap fuel <em>along your actual route</em>.</p>'
);

// Carpooling
content = content.replace(
  'financial rewards of carpooling heavily outweigh the minor inconveniences.</p>',
  'financial rewards of carpooling heavily outweigh the minor inconveniences. To maximize those shared savings, coordinate your fuel stops using <strong>Pumpprice.live</strong> on your shared route.</p>'
);

// Future of Synthetic Fuels
content = content.replace(
  'difficult to electrify, like aviation and motorsport.</p>',
  'difficult to electrify, like aviation and motorsport. While we wait for e-fuels to become affordable, standard combustion drivers can rely on <strong>Pumpprice.live</strong> to keep today\'s driving costs down.</p>'
);

fs.writeFileSync('Pumpprice/frontend/src/content/posts.ts', content);
console.log("Updated all posts!");
