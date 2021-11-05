/**
 * This file is part of the vscode-kanban distribution.
 * Copyright (c) Marcel Joachim Kloubert.
 *
 * vscode-kanban is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation, version 3.
 *
 * vscode-kanban is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import * as HtmlEntities from 'html-entities';
import * as vscode from 'vscode';
import * as vscode_helpers from 'vscode-helpers';

/**
 * Function to generate (additional) footer content.
 *
 * @return {string} The generated HTML code.
 */
export type GetFooterFunction = () => string;

/**
 * Options for 'generateFooter()' function.
 */
export interface GenerateFooterOptions extends ResourceUriResolver {
    /**
     * The function that generates additional footer content.
     */
    getFooter?: GetFooterFunction;
    /**
     * The path to the script.
     */
    scriptFile: string;
    /**
     * The path to the CSS file.
     */
    styleFile: string;
}

/**
 * Options for 'generateHeader()' function.
 */
export interface GenerateHeaderOptions extends ResourceUriResolver, WithTitle {
}

/**
 * Options for 'generateHtmlDocument()' function.
 */
export interface GenerateHtmlDocumentOptions extends HeaderButtonResolver, ResourceUriResolver, WithTitle {
    /**
     * The function that generates the (body) content.
     *
     * @return {string} The content.
     */
    getContent?: () => string;
    /**
     * The function that generates additional footer content.
     */
    getFooter?: GetFooterFunction;
    /**
     * The (internal) name of the document.
     */
    name: string;
}

/**
 * Options for 'generateNavBarHeader()' function.
 */
export interface GenerateNavBarHeaderOptions extends HeaderButtonResolver, ResourceUriResolver, WithTitle {
}

/**
 * Function to generate header buttons.
 *
 * @return {string} The generated HTML code.
 */
export type GetHeaderButtonsFunction = () => string;

/**
 * The function that returns the URI of a resource.
 *
 * @param {string} path The path inside the resource directory.
 *
 * @return {vscode.Uri} The URI.
 */
export type GetResourceUriFunction = (path: string) => vscode.Uri;

/**
 * An object that can resolve the HTML code for header buttons.
 */
export interface HeaderButtonResolver {
    /**
     * Custom function to generate header buttons.
     */
    getHeaderButtons?: GetHeaderButtonsFunction;
}

/**
 * An object that resolves a resource URI.
 */
export interface ResourceUriResolver {
    /**
     * The function that returns the URI of a web view resource.
     */
    getResourceUri: GetResourceUriFunction;
}

/**
 * An object that can use and handle a document title.
 */
export interface WithTitle {
    /**
     * The optional title.
     */
    title?: string;
}

/**
 * Generates the common content for footer.
 *
 * @param {GenerateFooterOptions} opts Options.
 *
 * @return {string} The generated HTML code.
 */
export function generateFooter(opts: GenerateFooterOptions) {
    return `
    <div id="vsckb-body-bottom" class="clearfix"></div>

    <link rel="stylesheet" href="${ opts.getResourceUri('css/style.css') }">
    <link rel="stylesheet" href="${ opts.getResourceUri('css/' + opts.styleFile + '.css') }" vsckb-style="custom">

    <script src="${ opts.getResourceUri('js/script.js') }" crossorigin="anonymous"></script>
    <script src="${ opts.getResourceUri('js/' + opts.scriptFile + '.js') }" crossorigin="anonymous"></script>

${ opts.getFooter ? opts.getFooter() : '' }

  </body>
</html>`;
}

/**
 * Generates the common content for 'head' tag.
 *
 * @param {GenerateHeaderOptions} opts Options.
 *
 * @return {string} The generated HTML code.
 */
export function generateHeader(opts: GenerateHeaderOptions) {
    const AJAX_LOADER_16x11 = `${ opts.getResourceUri('img/ajax-loader-16x11.gif') }`;

    const DOC_TITLE = getDocumentTitle(opts.title);

    return `<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">

        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

        <link rel="stylesheet" href="${ opts.getResourceUri('css/font-awesome.css') }">
        <link rel="stylesheet" href="${ opts.getResourceUri('css/hljs-atom-one-dark.css') }">
        <link rel="stylesheet" href="${ opts.getResourceUri('css/codemirror.css') }">
        <link rel="stylesheet" href="${ opts.getResourceUri('css/mermaid/mermaid.css') }">
        <link rel="stylesheet" href="${ opts.getResourceUri('css/mermaid/mermaid.dark.css') }">
        <link rel="stylesheet" href="${ opts.getResourceUri('css/bootstrap.min.css') }" vsckb-style="bootstrap">

        <script src="${ opts.getResourceUri('js/filtrex.js') }"></script>
        <script src="${ opts.getResourceUri('js/moment-with-locales.min.js') }"></script>
        <script src="${ opts.getResourceUri('js/highlight.pack.js') }"></script>
        <script src="${ opts.getResourceUri('js/codemirror/codemirror.js') }"></script>
        <script src="${ opts.getResourceUri('js/codemirror/addon/display/autorefresh.js') }"></script>
        <script src="${ opts.getResourceUri('js/codemirror/mode/markdown/markdown.js') }"></script>
        <script src="${ opts.getResourceUri('js/mermaid/mermaid.js') }"></script>
        <script src="${ opts.getResourceUri('js/mermaid/mermaidAPI.js') }"></script>
        <script src="${ opts.getResourceUri('js/showdown.min.js') }"></script>
        <script src="${ opts.getResourceUri('js/jquery.min.js') }" crossorigin="anonymous"></script>
        <script src="${ opts.getResourceUri('js/bootstrap.bundle.min.js') }" crossorigin="anonymous"></script>

        <script>
            const vscode = acquireVsCodeApi();

            function vsckb_log(msg) {
                try {
                    if (msg instanceof Error) {
                        msg = \`ERROR: \${ msg.message }

    \${ msg.stack }\`;
                    }

                    vscode.postMessage({
                        command: 'log',
                        data: {
                            message: JSON.stringify(msg)
                        }
                    });
                } catch (e) { }
            }

            window.onerror = function(message, url, line, column, error) {
                vsckb_log({
                    message: message,
                    url: url,
                    line: line,
                    column: column,
                    error: error
                });

                return false;
            };

            const VSCKB_AJAX_LOADER_16x11 = ${ JSON.stringify( AJAX_LOADER_16x11 ) };
        </script>

        <title>${ HtmlEntities.encode(DOC_TITLE) }</title>
    </head>
    <body>
        <div id="vsckb-body-top" class="clearfix"></div>
`;
}

/**
 * Generates a full HTML document.
 *
 * @param {GenerateHtmlDocumentOptions} opts Options.
 *
 * @return {string} The generated HTML code.
 */
export function generateHtmlDocument(opts: GenerateHtmlDocumentOptions) {
    return `${ generateHeader({
    getResourceUri: opts.getResourceUri,
    title: opts.title,
}) }

${ generateNavBarHeader({
    getHeaderButtons: opts.getHeaderButtons,
    getResourceUri: opts.getResourceUri,
    title: opts.title,
}) }

${ opts.getContent ? opts.getContent() : '' }

${ generateFooter({
    getFooter: opts.getFooter,
    getResourceUri: opts.getResourceUri,
    scriptFile: opts.name,
    styleFile: opts.name,
}) }`;
}

/**
 * Generates the common HTML for a header navbar.
 *
 * @param {GenerateNavBarHeaderOptions} opts Options.
 *
 * @return {string} The generated HTML code.
 */
export function generateNavBarHeader(opts: GenerateNavBarHeaderOptions) {
    const DOC_TITLE = getDocumentTitle(opts.title);

    return `
<header>
    <nav class="navbar navbar-dark fixed-top bg-dark">
        <a class="navbar-brand" href="#">
            <img src="${ opts.getResourceUri('img/icon.svg') }" width="30" height="30" class="d-inline-block align-top" alt="">
            <span>${ HtmlEntities.encode(DOC_TITLE) }</span>
        </a>

        <form class="form-inline">
            ${ opts.getHeaderButtons ? opts.getHeaderButtons() : '' }

            <div id="vsckb-social-media-btns">
                <a class="btn btn-dark btn-sm text-white vsckb-btn-with-known-url" vsckb-url="github" title="Open Project On GitHub">
                    <i class="fa fa-github" aria-hidden="true"></i>
                </a>

                <a class="btn btn-dark btn-sm text-white vsckb-btn-with-known-url" vsckb-url="twitter" title="Follow Author On Twitter">
                    <i class="fa fa-twitter" aria-hidden="true"></i>
                </a>

                <a class="btn btn-dark btn-sm text-white vsckb-btn-with-known-url" vsckb-url="paypal" title="Support Project via PayPal">
                    <i class="fa fa-paypal" aria-hidden="true"></i>
                </a>
            </div>
        </form>
    </nav>
</header>
`;
}

function getDocumentTitle(title: string) {
    title = vscode_helpers.toStringSafe(title).trim();

    let docTitle = 'Kanban Board';

    if ('' !== title) {
        docTitle = `${ docTitle } (${ title })`;
    }

    return docTitle;
}
