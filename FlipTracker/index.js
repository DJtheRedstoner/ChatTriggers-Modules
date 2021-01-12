import { Setting, SettingsObject } from "SettingsManager/SettingsManager";
import PDObject from "PersistentData";

const DecimalFormat = Java.type("java.text.DecimalFormat");
const EnumChatFormatting = Java.type("net.minecraft.util.EnumChatFormatting")

// You purchased DOG SHIT for 1,000,000 coins!
var buyRegex = /^You purchased (.+) for ([\d,]+) coins!$/
// [Auction] Technoblade bought DOG SHIT for 1,000,000 coins CLICK
var sellRegex = /^\[Auction] (\w{1,16}) bought (.+) for ([\d,]+) coins CLICK$/

var numberFormat = new DecimalFormat("###,###,###,###.##");

var sellSound = new Sound({
    "source": "sound.ogg"
})

var data = new PDObject("FlipTracker", {
    coins: 0
})

var settings = new SettingsObject("FlipTracker", [
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
    if(settings.getSetting("FlipTracker", "Show")) {
        x = (Renderer.screen.getWidth() / 1000) * settings.getSetting("FlipTracker", "X Position");
        y = (Renderer.screen.getHeight() / 1000) * settings.getSetting("FlipTracker", "Y Position");

        coins = numberFormat.format(data.coins);



        Renderer.drawString(`${data.coins < 0 ? "&c" : "&a"}Flipping Profit: ${coins}`, x, y)
    }
});

register("chat", event => {
    if(!settings.getSetting("FlipTracker", "Track")) return;
    message = EnumChatFormatting.func_110646_a(event.message.func_150260_c());

    buyResult = buyRegex.exec(message);
    if (buyResult !== null) {
        coins = Number(buyResult[2].replace(/,/g, ""));
        if(!isNaN(coins)) {
            data.coins -= coins
        }
    }
    sellResult = sellRegex.exec(message);
    if (sellResult !== null) {
        coins = Number(sellResult[3].replace(/,/g, ""));
        if(!isNaN(coins)) {
            data.coins += coins
        }
        onSell();
    }
});

function onSell() {
    if(settings.getSetting("FlipTracker", "Sound on Sell")) {
        sellSound.play();
    }
}