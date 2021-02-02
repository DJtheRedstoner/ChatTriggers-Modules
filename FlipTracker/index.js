import { Setting, SettingsObject } from "SettingsManager/SettingsManager";
import PDObject from "PersistentData";

const DecimalFormat = Java.type("java.text.DecimalFormat");
const EnumChatFormatting = Java.type("net.minecraft.util.EnumChatFormatting")

const buyRegex = /^You purchased (.+) for ([\d,]+) coins!$/
const sellRegex = /^(.+) (\w{1,16}) collected an auction for ([\d,]+) coins!$/
const salesRegex = /^\[Auction] (\w{1,16}) bought (.+) for ([\d,]+) coins CLICK$/

const numberFormat = new DecimalFormat("###,###,###,###.##");

const data = new PDObject("FlipTracker", {
    coins: 0
})

const settings = new SettingsObject("FlipTracker", [
    {
        "name": "FlipTracker",
        settings: [
            new Setting.Toggle("Show", true),
            new Setting.Toggle("Track", true),
            new Setting.Slider("X Position", 0, 0, 1000, 0),
            new Setting.Slider("Y Position", 0, 0, 1000, 0),
            new Setting.Toggle("Sound on Sell", true)
        ]
    }
]);
settings.setCommand("fliptracker");
Setting.register(settings);

register("renderOverlay", () => {
    if (!settings.getSetting("FlipTracker", "Show")) return;

    const x = (Renderer.screen.getWidth() / 1000) * settings.getSetting("FlipTracker", "X Position");
    const y = (Renderer.screen.getHeight() / 1000) * settings.getSetting("FlipTracker", "Y Position");

    const coins = numberFormat.format(data.coins);

    Renderer.drawString(`${data.coins < 0 ? "&c" : "&a"}Flipping Profit: ${coins}`, x, y)
});

register("chat", event => {
    if (!settings.getSetting("FlipTracker", "Track")) return;

    const message = EnumChatFormatting.func_110646_a(event.message.func_150260_c());

    const buyResult = buyRegex.exec(message);
    if (buyResult != null) {
		const coins = Number(buyResult[2].replace(/,/g, ""));
        if(!isNaN(coins)) {
            data.coins -= Number(coins)
        }
    }

    const sellResult = sellRegex.exec(message);
    if (sellResult != null) {
		const coins = Number(sellResult[3].replace(/,/g, ""));
        if(!isNaN(coins)) {
            data.coins += coins
        }
    }

    const salesResult = salesRegex.exec(message);
    if (salesResult !== null) {
        onSell();
    }
});

function onSell() {
    if(settings.getSetting("FlipTracker", "Sound on Sell")) {
        const sellSound = new Sound({
            "source": "sound.ogg"
        })

        sellSound.play();

        setTimeout(() => {
            sellSound.stop();
        }, 3000);
    }
}
