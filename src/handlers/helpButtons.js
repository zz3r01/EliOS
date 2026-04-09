import { createEmbed } from '../utils/embeds.js';
import { createButton, createSelectMenu, getPaginationRow } from '../utils/components.js';
import { createAllCommandsMenu } from './helpSelectMenus.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Collection, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMMAND_LIST_ID = "help-command-list";
const BACK_BUTTON_ID = "help-back-to-main";
const CATEGORY_SELECT_ID = "help-category-select";
const ALL_COMMANDS_ID = "help-all-commands";
const PAGINATION_PREFIX = "help-page";
const BUG_REPORT_BUTTON_ID = "help-bug-report";

const CATEGORY_ICONS = {
    Core: "ℹ️",
    Moderation: "🛡️",
    Economy: "💰",
    Fun: "🎮",
    Leveling: "📊",
    Utility: "🔧",
    Ticket: "🎫",
    Welcome: "👋",
    Giveaway: "🎉",
    Counter: "🔢",
    Tools: "🛠️",
    Search: "🔍",
    Reaction_Roles: "🎭",
    Community: "👥",
    Birthday: "🎂",
    Config: "⚙️",
};

async function createCategorySelectMenu() {
    const commandsPath = path.join(__dirname, "../commands");
    const categoryDirs = (
        await fs.readdir(commandsPath, { withFileTypes: true })
    )
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name)
        .sort();

    const options = [
        {
           label: "📋 Все команды",
description: "Просмотреть все доступные команды с пагинацией",
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
    title: "🤖 Центр помощи EliOS",
    description: "Ваш универсальный помощник в Discord для модерации, экономики, развлечений и управления сервером.\n\nВыберите категорию ниже, чтобы ознакомиться с нашими мощными командами:",
    color: 'primary'
});

embed.addFields(
    {
        name: "🛡️ **Модерация**",
        value: "Инструменты для модерации сервера, управления пользователями и контроля",
        inline: true
    },
    {
        name: "💰 **Экономика**",
        value: "Система валюты, магазины и виртуальная экономика",
        inline: true
    },
    {
        name: "🎮 **Развлечения**",
        value: "Игры, развлечения и интерактивные команды",
        inline: true
    },
    {
        name: "📊 **Уровни**",
        value: "Уровни пользователей, система опыта (XP) и отслеживание прогресса",
        inline: true
    },
    {
        name: "🎫 **Тикеты**",
        value: "Система тикетов для поддержки и управления сервером",
        inline: true
    },
    {
        name: "🎉 **Розыгрыши**",
        value: "Автоматическое управление розыгрышами и выдача призов",
        inline: true
    },
    {
        name: "👋 **Приветствие**",
        value: "Сообщения приветствия и онбординг новых участников",
        inline: true
    },
    {
        name: "🎂 **Дни рождения**",
        value: "Отслеживание дней рождения и поздравления",
        inline: true
    },
    {
        name: "🔧 **Утилиты**",
        value: "Полезные инструменты и функции для сервера",
        inline: true
    }
);
    
    embed.setFooter({
        text: "Поддерживается Производственной Службой"
    });
    embed.setTimestamp();

    const bugReportButton = new ButtonBuilder()
        .setCustomId(BUG_REPORT_BUTTON_ID)
        .setLabel("Report Bug")
        .setStyle(ButtonStyle.Danger);

    const supportButton = new ButtonBuilder()
        .setLabel("Support Server")
        .setURL("https://discord.gg/QnWNz2dKCE")
        .setStyle(ButtonStyle.Link);

    const touchpointButton = new ButtonBuilder()
        .setLabel("Learn from Touchpoint")
        .setURL("https://www.youtube.com/@TouchDisc")
        .setStyle(ButtonStyle.Link);

    const selectRow = createSelectMenu(
        CATEGORY_SELECT_ID,
        "Select to view the commands",
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

export const helpBackButton = {
    name: BACK_BUTTON_ID,
    async execute(interaction, client) {
        try {
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferUpdate();
            }

            const { embeds, components } = await createCategorySelectMenu();
            await interaction.editReply({
                embeds,
                components,
            });
        } catch (error) {
            if (error?.code === 40060 || error?.code === 10062) {
                logger.warn('Help back button interaction already acknowledged or expired.', {
                    event: 'interaction.help.button.unavailable',
                    errorCode: String(error.code),
                    customId: interaction.customId,
                    interactionId: interaction.id,
                });
                return;
            }

            throw error;
        }
    },
};

export const helpBugReportButton = {
    name: BUG_REPORT_BUTTON_ID,
    async execute(interaction, client) {
        const githubButton = new ButtonBuilder()
            .setLabel('🐛 Сообщи нам о проблеме')
            .setStyle(ButtonStyle.Link)
            .setURL('https://discord.com/channels/1472565480249229474');

        const bugRow = new ActionRowBuilder().addComponents(githubButton);

        const bugReportEmbed = createEmbed({
    title: '🐛 Отчёт об ошибке',
    description: 'Нашли баг? Пожалуйста, сообщите о нём на нашем сервере поддержки!\n\n' +
        '**При сообщении об ошибке, пожалуйста, укажите:**\n' +
        '• 📝 Подробное описание проблемы\n' +
        '• 📋 Шаги для воспроизведения\n' +
        '• 📸 Скриншоты (если есть)\n' +
        '• 💻 Версию бота и вашу среду\n\n' +
        'Это поможет нам быстрее и эффективнее исправить проблему!',
            color: 'error'
        });
        bugReportEmbed.setFooter({
            text: 'TitanBot Bug Reporting System',
            iconURL: client.user.displayAvatarURL()
        });
        bugReportEmbed.setTimestamp();

        await interaction.reply({
            embeds: [bugReportEmbed],
            components: [bugRow],
            flags: MessageFlags.Ephemeral
        });
    },
};

export const helpReportCommand = {
    name: COMMAND_LIST_ID,
    categoryName: null,
    async execute(interaction, client) {
        
    }
};

function getPaginationInfo(components) {
    for (const row of components || []) {
        for (const component of row.components || []) {
            if (component.customId === `${PAGINATION_PREFIX}_page`) {
                const label = component.label || '';
                const match = label.match(/Page\s+(\d+)\s+of\s+(\d+)/i);
                if (match) {
                    return {
                        currentPage: Number(match[1]),
                        totalPages: Number(match[2]),
                    };
                }
            }
        }
    }

    return { currentPage: 1, totalPages: 1 };
}

export const helpPaginationButton = {
    name: `${PAGINATION_PREFIX}_next`,
    async execute(interaction, client) {
        try {
            if (!interaction.deferred && !interaction.replied) {
                await interaction.deferUpdate();
            }

            const { currentPage, totalPages } = getPaginationInfo(interaction.message?.components);

            let nextPage = currentPage;
            switch (interaction.customId) {
                case `${PAGINATION_PREFIX}_first`:
                    nextPage = 1;
                    break;
                case `${PAGINATION_PREFIX}_prev`:
                    nextPage = Math.max(1, currentPage - 1);
                    break;
                case `${PAGINATION_PREFIX}_next`:
                    nextPage = Math.min(totalPages, currentPage + 1);
                    break;
                case `${PAGINATION_PREFIX}_last`:
                    nextPage = totalPages;
                    break;
                default:
                    nextPage = currentPage;
                    break;
            }

            const { embeds, components } = await createAllCommandsMenu(nextPage, client);
            await interaction.editReply({ embeds, components });
        } catch (error) {
            if (error?.code === 40060 || error?.code === 10062) {
                logger.warn('Help pagination interaction already acknowledged or expired.', {
                    event: 'interaction.help.pagination.unavailable',
                    errorCode: String(error.code),
                    customId: interaction.customId,
                    interactionId: interaction.id,
                });
                return;
            }

            throw error;
        }
    },
};


