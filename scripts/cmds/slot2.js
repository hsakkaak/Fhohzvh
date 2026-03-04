module.exports = {
  config: {
    name: "slot2",
    version: "5.0",
    author: "MAHBUB ALIHSAN SHOUROV",
    description: {
      role: 0,
      en: "Classic Slot Machine Game (Normal System)"
    },
    category: "game"
  },
  langs: {
    en: {
      invalid_amount: "❌ Please enter a valid bet amount!",
      not_enough_money: "💸 You don't have enough balance to bet that much!",
      min_bet: "⚠️ Minimum bet is %1$",
      win_message: "You won %1$!",
      lose_message: "You lost %1$!",
      jackpot_message: "JACKPOT! All 4 matched!\n💰 You won: %1$",
      three_match: "✅ Three symbols matched!\n💰 You won: %1$",
      two_match: "✅ Two symbols matched!\n💰 You won: %1$",
      no_match: "❌ No match!\n💸 You lost: %1$"
    }
  },

  onStart: async function ({ args, message, event, getLang, usersData, api }) {
    const { senderID } = event;
    const bet = parseInt(args[0]);

    if (isNaN(bet) || bet <= 0) {
      return message.reply(getLang("invalid_amount"));
    }
    if (bet < 50) {
      return message.reply(getLang("min_bet", 50));
    }

    const userData = await usersData.get(senderID);
    const money = userData.money || 0;

    if (bet > money) {
      return message.reply(getLang("not_enough_money"));
    }

    const { slots, winnings, outcome, matchedCount } = generateSlotOutcome(bet);

    await usersData.set(senderID, {
      money: money + winnings
    });

    const absWin = Math.abs(Math.round(winnings));
    const spinLine = `${slots[0]} | ${slots[1]} | ${slots[2]} | ${slots[3]}`;

    let result = `🎰 𝗦𝗟𝗢𝗧 𝗠𝗔𝗖𝗛𝗜𝗡𝗘 🎰\n`;
    result += `━━━━━━━━━━━━━━━\n`;
    result += `${spinLine}\n`;
    result += `━━━━━━━━━━━━━━━\n`;
    result += `🎯 Bet: ${bet}$\n`;

    if (winnings > 0) {
      if (outcome === "jackpot") {
        result += `🥇 𝗝𝗔𝗖𝗞𝗣𝗢𝗧! All 4 matched!\n💰 You won: ${absWin}$`;
      } else if (matchedCount === 3) {
        result += `✅ Three symbols matched!\n💰 You won: ${absWin}$`;
      } else {
        result += `✅ Two symbols matched!\n💰 You won: ${absWin}$`;
      }
    } else {
      result += `❌ No match!\n💸 You lost: ${absWin}$`;
    }

    const s1 = slots[0];
    const s2 = slots[1];
    const s3 = slots[2];
    const s4 = slots[3];

    const frames = [
      `🔲⏳🔲⏳`,
      `${s1} ⏳🔲⏳`,
      `${s1}${s2} 🔲⏳`,
      `${s1}${s2}${s3} 🔲⏳`
    ];

    const sent = await message.reply(frames[0]);
    const msgID = sent.messageID;

    setTimeout(() => {
      api.editMessage(frames[1], msgID, () => {});
    }, 500);

    setTimeout(() => {
      api.editMessage(frames[2], msgID, () => {});
    }, 1000);

    setTimeout(() => {
      api.editMessage(frames[3], msgID, () => {});
    }, 1500);

    setTimeout(() => {
      api.editMessage(result, msgID, (err) => {
        if (err) message.reply(result);
      });
    }, 2000);
  }
};



const symbols = ["🍇", "🍉", "🍊", "🍏", "🍓", "🤫", "🍒", "🍌", "🥝", "👅", "🥑", "🌽", "7⃣", "🫦", "☢️", "✨", "🦋"];

const PROB = {
  lose: 27.8,
  small: 36.6,
  medium: 25.3,
  jackpot: 10.3
};

function generateSlotOutcome(bet) {
  const outcome = randomOutcome();
  let winnings = 0;
  let slots = [];

  if (outcome === "lose") {
    slots = generateLose();
    winnings = -bet;
  } else if (outcome === "small") {
    slots = generateSmallWin();
    winnings = bet * 1.5;
  } else if (outcome === "medium") {
    slots = generateMediumWin();
    winnings = bet * 2;
  } else if (outcome === "jackpot") {
    slots = generateJackpot();
    winnings = bet * 10;
  }

  const counts = {};
  for (const s of slots) counts[s] = (counts[s] || 0) + 1;
  const matchedCount = Math.max(...Object.values(counts));

  return { slots, winnings, outcome, matchedCount };
}

function randomOutcome() {
  const r = Math.random() * 100;
  if (r < PROB.lose) return "lose";
  if (r < PROB.lose + PROB.small) return "small";
  if (r < PROB.lose + PROB.small + PROB.medium) return "medium";
  return "jackpot";
}

function generateLose() {
  let chosen = new Set();
  while (chosen.size < 4) {
    chosen.add(symbols[Math.floor(Math.random() * symbols.length)]);
  }
  return Array.from(chosen);
}

function generateSmallWin() {
  const sym = randomPick(symbols);
  const others = symbols.filter(s => s !== sym);
  return shuffle([sym, sym, randomPick(others), randomPick(others)]);
}

function generateMediumWin() {
  const sym = randomPick(symbols);
  const others = symbols.filter(s => s !== sym);
  return shuffle([sym, sym, sym, randomPick(others)]);
}

function generateJackpot() {
  const sym = randomPick(symbols);
  return [sym, sym, sym, sym];
}

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(a) {
  return a.sort(() => Math.random() - 0.5);
}