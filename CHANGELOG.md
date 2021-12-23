# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 0.0.0 (2021-12-23)


### Features

* **core:** added a way to pass general options (such as a theme) to the table ([88c93e7](https://github.com/LukasMarx/canvas-table/commits/88c93e7403a74c00d388341da8de24035faac527))
* **core:** added basic grouping functionality [#4](https://github.com/LukasMarx/canvas-table/issues/4) ([01daada](https://github.com/LukasMarx/canvas-table/commits/01daada3ffde3245c9d4f64f357a0fe9c69a56ab))
* **core:** Added configuration options for number of threads ([0b4203d](https://github.com/LukasMarx/canvas-table/commits/0b4203d0210b2abebff175b67b4625e2f719602d))
* **core:** Added interface for formatters ([9bc723e](https://github.com/LukasMarx/canvas-table/commits/9bc723e1940b87e326420cbc0c7881392dc34763))
* **core:** added moveable rows (non-tree only for now) ([2604486](https://github.com/LukasMarx/canvas-table/commits/2604486cea8f6753c046fdb091d2a36431d928a4))
* **core:** added pinned columns ([acc3481](https://github.com/LukasMarx/canvas-table/commits/acc348130878873f7e1a505b406281d8e5efde21))
* **core:** added row-filtering via query prop ([d88e4ba](https://github.com/LukasMarx/canvas-table/commits/d88e4bad1b75f1f43abaf0223c15a457c2632981))
* **core:** added sorting ([03e1969](https://github.com/LukasMarx/canvas-table/commits/03e1969fa2cd39a3d1db63a2300458d0c311e1b5))
* **core:** render only visible columns ([940072a](https://github.com/LukasMarx/canvas-table/commits/940072a234c7a80770ae5a14f8401d090b286eaa))
* **core:** resizeable and reorderable headers ([0d84a3a](https://github.com/LukasMarx/canvas-table/commits/0d84a3a1d6a682056324e4a71ed634ee33ec4a6e))
* **core:** split rendering over multiple worker ([66a10dd](https://github.com/LukasMarx/canvas-table/commits/66a10dd9b6f8c1cbabd9361213140a0e641af461))
* **dev:** added storybook ([6a43ed2](https://github.com/LukasMarx/canvas-table/commits/6a43ed2bde3afbeac41c5225823ebc3b30cd64b7))
* **formatter:** added boolean formatter to demonstrate react-svg-component rendering ([ac233d7](https://github.com/LukasMarx/canvas-table/commits/ac233d7a9553ff99c11104a06f738d3a7be172bb))
* **git:** inital commit ([f69dc4d](https://github.com/LukasMarx/canvas-table/commits/f69dc4d6d12b6ef13b23a7ca35e55bbca6aaf9b3))
* **tree:** added tree-level-indicators ([cc0baa3](https://github.com/LukasMarx/canvas-table/commits/cc0baa3caee772665fda2a1a311625bf3298d816))


### Bug Fixes

* build and export are now working ([e916d3f](https://github.com/LukasMarx/canvas-table/commits/e916d3f2f923c706aa360c736bbabe89cf48e9d4))
* **core:** adjusted size of lock-icon for pinned columns ([8fbe3b2](https://github.com/LukasMarx/canvas-table/commits/8fbe3b28bab2be8081d34b0ab8d105bca2d4f3c0))
* **core:** div scroll height is now calculated instead of estimated ([0dc8954](https://github.com/LukasMarx/canvas-table/commits/0dc8954caa265ecfea6d665234f848754a80c47e))
* **core:** fixed an issue where grouped rows had an ivisible tree control ([edc71d2](https://github.com/LukasMarx/canvas-table/commits/edc71d2bfd9a3d6df54e4b0d54a40c9402163d78))
* **core:** fixed an issue where there was blank scape on the bottom when scrolling ([d1dbecf](https://github.com/LukasMarx/canvas-table/commits/d1dbecf3af52f834022301fe7128aae2e942854c))
* **core:** fixed scroll-event not working properly ([6b40b6a](https://github.com/LukasMarx/canvas-table/commits/6b40b6a45bc0afa5281eae883b9f1c4eff135137))
* **core:** re-calculate selection after sort-change ([2090062](https://github.com/LukasMarx/canvas-table/commits/2090062bae6887bb8ecfdd56875b6607dc642c87))
* **core:** resolved an issue where column-headers missalign with table cells ([33c8c46](https://github.com/LukasMarx/canvas-table/commits/33c8c46342989b6b2a2ce9c38e21a0f75fdfad37))
* **header:** Fixed resizing columns no longer working ([aa4c6af](https://github.com/LukasMarx/canvas-table/commits/aa4c6afc03af47bd8687f85fc39ae830f037b746))
* **tree:** expanded-indizes are now correctly calculated ([654502e](https://github.com/LukasMarx/canvas-table/commits/654502e0fb9a848664d0e752ff44b96e1922f544))
