import {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} from "discord.js";
import { InteractionHelper } from '../../utils/interactionHelper.js';
import { createEmbed } from "../../utils/embeds.js";
import {
    createSelectMenu,
} from "../../utils/components.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATEGORY_SELECT_ID = "help-category-select";
const ALL_COMMANDS_ID = "help-all-commands";
const BUG_REPORT_BUTTON_ID = "help-bug-report";
const HELP_MENU_TIMEOUT_MS = 5 * 60 * 1000;

const CATEGORY_ICONS = {
    Основное: "ℹ️",
    Модерация: "🛡️",
    Экономика: "💰",
    Игры: "🎮",
    Уровни: "📊",
    Инструменты: "🔧",
    Тикеты: "🎫",
    Приветсвие: "👋",
    Раздачи: "🎉",
    Счетчик: "🔢",
    Предметы: "🛠️",
    Поиск: "🔍",
    Роли_за_Реакции: "🎭",
    Комьюнити: "👥",
    Дни_Рождения: "🎂",
    Настройки: "⚙️",
};





async function createInitialHelpMenu() {
    const commandsPath = path.join(__dirname, "../../commands");
    const categoryDirs = (
        await fs.readdir(commandsPath, { withFileTypes: true })
    )
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name)
        .sort();

    const options = [
        {
            label: "📋 Все команды",
            description: "Просмотреть все доступные команды с постраничной навигацией",
            value: ALL_COMMANDS_ID,
        },
        ...categoryDirs.map((category) => {
            const categoryName =
                category.charAt(0).toUpperCase() +
                category.slice(1).toLowerCase();
            const icon = CATEGORY_ICONS[categoryName] || "🔍";
            return {
                label: `${icon} ${categoryName}`,
                description: `View commands in the ${categoryName} category`,
                value: category,
            };
        }),
    ];

    const embed = createEmbed({ 
        title: "🤖 Операционная Система ЭлиОС",
        description: "Ваш универсальный помощник, и искуственный мозг",
        color: 'primary'
    });

    embed.addFields(
        {
            name: "🛡️ **Модерация**",
            value: "Модерация сервера, управление пользователями и инструменты обеспечения правил",
            inline: true
        },
        {
            name: "💰 **Экономика**",
            value: "Валютная система, магазины и виртуальная экономика",
            inline: true
        },
        {
            name: "🎮 **Игры**",
            value: "Игры, развлечение и интерактивные команды",
            inline: true
        },
        {
            name: "📊 **Уровни**",
            value: "Уровни пользователей, система опыта и отслеживание прогресса",
            inline: true
        },
        {
            name: "🎫 **Тикеты**",
            value: "Система поддержки заявок для управления сервером",
            inline: true
        },
        {
            name: "🎉 **Раздачи**",
            value: "Автоматизированное управление раздачами и их распределением",
            inline: true
        },
        {
            name: "👋 **Приветсвие**",
            value: "Приветственные сообщения для участников и процесс адаптации",
            inline: true
        },
        {
            name: "🎂 **Дни Рождения**",
            value: "Функции отслеживания и празднования дней рождения",
            inline: true
        },
        {
            name: "👥 **Комьюнити**",
            value: "Инструменты сообщества, приложения и взаимодействие участников",
            inline: true
        },
        {
            name: "⚙️ **Настройки**",
            value: "Команды управления конфигурацией сервера и бота",
            inline: true
        },
        {
            name: "🔢 **Счетчик**",
            value: "Настройка канала живого счётчика и элементы управления счётчиком",
            inline: true
        },
        {
            name: "🎙️ **Приватные комнаты**",
            value: "Динамическое создание и управление голосовыми каналами",
            inline: true
        },
        {
            name: "🎭 **Роли за реакцию**",
            value: "Самостоятельно назначаемые роли с использованием систем реакций на роли",
            inline: true
        },
        {
            name: "✅ **Верификация**",
            value: "Процессы проверки участников и ограничения доступа",
            inline: true
        },
        {
            name: "🔧 **Инструменты**",
            value: "Полезные инструменты и серверные утилиты",
            inline: true
        }
    );

    embed.setFooter({ 
        text: "Произведено Производственной Службой" 
    });
    embed.setTimestamp();

    const bugReportButton = new ButtonBuilder()
        .setCustomId(BUG_REPORT_BUTTON_ID)
        .setLabel("Сообщить о проблеме")
        .setStyle(ButtonStyle.Danger);

    const supportButton = new ButtonBuilder()
        .setLabel("Сервер Поддержки")
        .setURL("https://discord.gg/A9Jd6CpBQH")
        .setStyle(ButtonStyle.Link);

    const selectRow = createSelectMenu(
        CATEGORY_SELECT_ID,
        "Выберите, чтобы просмотреть команды",
        options,
    );

    const buttonRow = new ActionRowBuilder().addComponents([
        bugReportButton,
        supportButton,
        touchpointButton,
    ]);

    return {
        embeds: [embed],
        components: [buttonRow, selectRow],
    };
}

export default {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Отображает меню помощи со всеми доступными командами"),

    async execute(interaction, guildConfig, client) {
        
        const { MessageFlags } = await import('discord.js');
        await InteractionHelper.safeDefer(interaction);
        
        const { embeds, components } = await createInitialHelpMenu();

        await InteractionHelper.safeEditReply(interaction, {
            embeds,
            components,
        });

        setTimeout(async () => {
            try {
                const closedEmbed = createEmbed({
                    title: "Меню помощи закрыто",
                    description: "Меню помощи было закрыто, используйте /help снова.",
                    color: "secondary",
                });

                await InteractionHelper.safeEditReply(interaction, {
                    embeds: [closedEmbed],
                    components: [],
                });
            } catch (error) {
                
            }
        }, HELP_MENU_TIMEOUT_MS);
    },
};


