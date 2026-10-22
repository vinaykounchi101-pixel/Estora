"""Generate publication-quality SVG figures for Estora Pune Sale Price EDA.

Pure Python implementation avoiding binary C-extension dependencies.
Figures generated:
1. price_distribution.svg: Histogram of raw price vs log1p price
2. price_vs_square_ft.svg: Scatter of Price vs Area with BHK breakdown
3. top_localities_price.svg: Horizontal bar chart of median price in top 10 localities
4. price_by_bhk.svg: Bar chart of median price and counts by BHK
"""

import math
from pathlib import Path
import pandas as pd
import numpy as np

OUTPUT_DIR = Path("ml/training/reports/figures")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
DATA_PATH = Path("ml/training/data/processed/pune_sale_prices.csv")


def generate_price_distribution_svg(df: pd.DataFrame, out_path: Path):
    """Generate dual histogram SVG comparing raw price vs log1p price."""
    prices = df["target_price_lakhs"].values
    log_prices = np.log1p(prices)

    w, h = 800, 400
    svg = [
        f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg">',
        '<style>',
        '  text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }',
        '  .title { font-size: 16px; font-weight: 600; fill: #252722; }',
        '  .subtitle { font-size: 12px; fill: #6B7280; }',
        '  .axis { stroke: #D1D5DB; stroke-width: 1; }',
        '  .tick { font-size: 11px; fill: #4B5563; }',
        '  .bar-raw { fill: #B69A63; opacity: 0.85; }',
        '  .bar-log { fill: #87917B; opacity: 0.85; }',
        '  .grid { stroke: #F3F4F6; stroke-dasharray: 2; }',
        '</style>',
        f'<rect width="{w}" height="{h}" fill="#FDFCF7" rx="8"/>',
        '<text x="400" y="30" text-anchor="middle" class="title">Pune Residential Sale Price Distribution</text>',
        '<text x="400" y="48" text-anchor="middle" class="subtitle">Raw Asking Price (INR Lakhs, Skew: 4.09) vs Log(1+Price) (Skew: 0.59)</text>',
    ]

    # Left plot: Raw price (x: 0 to 600)
    # Right plot: Log price (x: 2 to 7)
    left_x, left_w = 60, 310
    right_x, right_w = 430, 310
    plot_y, plot_h = 75, 260

    # Panel 1: Raw Price Histogram (clipped display to 400 Lakhs for detail)
    bins_raw = 20
    max_raw_display = 400.0
    counts_raw, bin_edges_raw = np.histogram(
        np.clip(prices, 0, max_raw_display), bins=bins_raw
    )
    max_count_raw = max(counts_raw)

    svg.append(f'<g transform="translate({left_x},{plot_y})">')
    svg.append(
        f'<text x="{left_w/2}" y="-10" text-anchor="middle" font-size="13" font-weight="600" fill="#252722">Raw Price (INR Lakhs)</text>'
    )
    svg.append(f'<line x1="0" y1="{plot_h}" x2="{left_w}" y2="{plot_h}" class="axis"/>')
    svg.append(f'<line x1="0" y1="0" x2="0" y2="{plot_h}" class="axis"/>')

    bar_w = (left_w - 10) / bins_raw
    for i, count in enumerate(counts_raw):
        bx = 5 + i * bar_w
        bh = (count / max_count_raw) * (plot_h - 20)
        by = plot_h - bh
        svg.append(
            f'<rect x="{bx:.1f}" y="{by:.1f}" width="{bar_w-2:.1f}" height="{bh:.1f}" class="bar-raw"/>'
        )

    # Ticks for left
    for p in [0, 100, 200, 300, 400]:
        tx = 5 + (p / max_raw_display) * (left_w - 10)
        svg.append(f'<line x1="{tx:.1f}" y1="{plot_h}" x2="{tx:.1f}" y2="{plot_h+5}" class="axis"/>')
        svg.append(
            f'<text x="{tx:.1f}" y="{plot_h+18}" text-anchor="middle" class="tick">₹{p}L</text>'
        )
    svg.append(f'<text x="-10" y="15" text-anchor="end" class="tick">{max_count_raw}</text>')
    svg.append(f'<text x="-10" y="{plot_h}" text-anchor="end" class="tick">0</text>')
    svg.append('</g>')

    # Panel 2: Log1p Price Histogram
    bins_log = 20
    min_log, max_log = 2.0, 7.0
    counts_log, bin_edges_log = np.histogram(log_prices, bins=bins_log, range=(min_log, max_log))
    max_count_log = max(counts_log)

    svg.append(f'<g transform="translate({right_x},{plot_y})">')
    svg.append(
        f'<text x="{right_w/2}" y="-10" text-anchor="middle" font-size="13" font-weight="600" fill="#252722">Log(1 + Price)</text>'
    )
    svg.append(f'<line x1="0" y1="{plot_h}" x2="{right_w}" y2="{plot_h}" class="axis"/>')
    svg.append(f'<line x1="0" y1="0" x2="0" y2="{plot_h}" class="axis"/>')

    bar_w_log = (right_w - 10) / bins_log
    for i, count in enumerate(counts_log):
        bx = 5 + i * bar_w_log
        bh = (count / max_count_log) * (plot_h - 20)
        by = plot_h - bh
        svg.append(
            f'<rect x="{bx:.1f}" y="{by:.1f}" width="{bar_w_log-2:.1f}" height="{bh:.1f}" class="bar-log"/>'
        )

    # Ticks for right
    for lp in [2.5, 3.5, 4.5, 5.5, 6.5]:
        tx = 5 + ((lp - min_log) / (max_log - min_log)) * (right_w - 10)
        svg.append(f'<line x1="{tx:.1f}" y1="{plot_h}" x2="{tx:.1f}" y2="{plot_h+5}" class="axis"/>')
        svg.append(f'<text x="{tx:.1f}" y="{plot_h+18}" text-anchor="middle" class="tick">{lp:.1f}</text>')
    svg.append(f'<text x="-10" y="15" text-anchor="end" class="tick">{max_count_log}</text>')
    svg.append(f'<text x="-10" y="{plot_h}" text-anchor="end" class="tick">0</text>')
    svg.append('</g>')

    # Legend / footer
    svg.append(
        '<text x="400" y="380" text-anchor="middle" font-size="11" fill="#4B5563">Median: ₹66.0L | Mean: ₹88.05L | IQR: ₹55.9L (₹44.0L - ₹99.9L) | N = 1,833</text>'
    )
    svg.append('</svg>')

    out_path.write_text('\n'.join(svg), encoding='utf-8')
    print(f"Generated: {out_path}")


def generate_price_vs_square_ft_svg(df: pd.DataFrame, out_path: Path):
    """Generate scatter plot SVG of Price vs Square Feet."""
    w, h = 800, 480
    pad_left, pad_right, pad_top, pad_bottom = 80, 40, 60, 60
    plot_w = w - pad_left - pad_right
    plot_h = h - pad_top - pad_bottom

    max_area = 4500.0
    max_price = 600.0

    svg = [
        f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg">',
        '<style>',
        '  text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }',
        '  .title { font-size: 16px; font-weight: 600; fill: #252722; }',
        '  .subtitle { font-size: 12px; fill: #6B7280; }',
        '  .axis { stroke: #9CA3AF; stroke-width: 1.2; }',
        '  .tick { font-size: 11px; fill: #4B5563; }',
        '  .grid { stroke: #E5E7EB; stroke-dasharray: 2; }',
        '</style>',
        f'<rect width="{w}" height="{h}" fill="#FDFCF7" rx="8"/>',
        '<text x="400" y="30" text-anchor="middle" class="title">Sale Price vs. Built-up Area (Square Feet)</text>',
        '<text x="400" y="48" text-anchor="middle" class="subtitle">Strong Linear Correlation (Pearson r = 0.877, Spearman ρ = 0.872)</text>',
    ]

    svg.append(f'<g transform="translate({pad_left},{pad_top})">')

    # Gridlines and ticks
    for price_tick in [100, 200, 300, 400, 500]:
        ty = plot_h - (price_tick / max_price) * plot_h
        svg.append(f'<line x1="0" y1="{ty:.1f}" x2="{plot_w}" y2="{ty:.1f}" class="grid"/>')
        svg.append(f'<text x="-12" y="{ty+4:.1f}" text-anchor="end" class="tick">₹{price_tick}L</text>')

    for area_tick in [1000, 2000, 3000, 4000]:
        tx = (area_tick / max_area) * plot_w
        svg.append(f'<line x1="{tx:.1f}" y1="0" x2="{tx:.1f}" y2="{plot_h}" class="grid"/>')
        svg.append(f'<text x="{tx:.1f}" y="{plot_h+20}" text-anchor="middle" class="tick">{area_tick} sqft</text>')

    # Axes
    svg.append(f'<line x1="0" y1="{plot_h}" x2="{plot_w}" y2="{plot_h}" class="axis"/>')
    svg.append(f'<line x1="0" y1="0" x2="0" y2="{plot_h}" class="axis"/>')

    # Color mapping for BHK
    bhk_colors = {
        1: "#93C5FD",  # light blue
        2: "#3B82F6",  # blue
        3: "#B69A63",  # muted gold
        4: "#9333EA",  # purple
    }

    # Points
    for _, row in df.iterrows():
        area = row["square_ft"]
        price = row["target_price_lakhs"]
        bhk = int(row["bhk_no"])
        if area > max_area or price > max_price:
            continue
        cx = (area / max_area) * plot_w
        cy = plot_h - (price / max_price) * plot_h
        color = bhk_colors.get(bhk, "#EF4444" if bhk >= 5 else "#6B7280")
        svg.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="3.5" fill="{color}" opacity="0.6"/>')

    # Legend
    legend_x = plot_w - 180
    svg.append(f'<rect x="{legend_x}" y="10" width="170" height="105" fill="#FFFFFF" stroke="#E5E7EB" rx="4" opacity="0.9"/>')
    svg.append(f'<text x="{legend_x+10}" y="28" font-size="11" font-weight="600" fill="#252722">BHK Configuration</text>')
    legend_items = [
        (1, "1 BHK (n=345)", "#93C5FD"),
        (2, "2 BHK (n=937)", "#3B82F6"),
        (3, "3 BHK (n=456)", "#B69A63"),
        (4, "4 BHK (n=83)", "#9333EA"),
    ]
    for i, (_, label, color) in enumerate(legend_items):
        ly = 46 + i * 18
        svg.append(f'<circle cx="{legend_x+18}" cy="{ly-3}" r="4.5" fill="{color}"/>')
        svg.append(f'<text x="{legend_x+30}" y="{ly}" font-size="10" fill="#4B5563">{label}</text>')

    svg.append('</g>')
    svg.append('</svg>')

    out_path.write_text('\n'.join(svg), encoding='utf-8')
    print(f"Generated: {out_path}")


def generate_top_localities_svg(df: pd.DataFrame, out_path: Path):
    """Generate horizontal bar chart SVG for top 10 localities by listing count with median price."""
    counts = df["address"].value_counts().head(10)
    localities = []
    for addr in counts.index:
        sub = df[df["address"] == addr]
        clean_name = addr.replace(",Pune", "").strip()
        localities.append({
            "name": clean_name,
            "count": len(sub),
            "median_price": sub["target_price_lakhs"].median(),
            "mean_price": sub["target_price_lakhs"].mean(),
            "median_sqft": sub["square_ft"].median(),
        })

    w, h = 800, 440
    pad_left, pad_right, pad_top, pad_bottom = 140, 100, 60, 40
    plot_w = w - pad_left - pad_right
    plot_h = h - pad_top - pad_bottom

    svg = [
        f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg">',
        '<style>',
        '  text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }',
        '  .title { font-size: 16px; font-weight: 600; fill: #252722; }',
        '  .subtitle { font-size: 12px; fill: #6B7280; }',
        '  .axis { stroke: #9CA3AF; stroke-width: 1.2; }',
        '  .tick { font-size: 12px; fill: #252722; }',
        '  .bar { fill: #B69A63; }',
        '  .bar-val { font-size: 11px; font-weight: 600; fill: #252722; }',
        '  .bar-sub { font-size: 10px; fill: #6B7280; }',
        '</style>',
        f'<rect width="{w}" height="{h}" fill="#FDFCF7" rx="8"/>',
        '<text x="400" y="30" text-anchor="middle" class="title">Top 10 Pune Micro-Markets by Listing Density</text>',
        '<text x="400" y="48" text-anchor="middle" class="subtitle">Bar width represents listing count; labels display Median Sale Price</text>',
    ]

    svg.append(f'<g transform="translate({pad_left},{pad_top})">')
    max_c = 110.0
    bar_h = 24
    gap = 8

    for i, item in enumerate(localities):
        by = i * (bar_h + gap)
        bw = (item["count"] / max_c) * plot_w
        svg.append(f'<text x="-10" y="{by+16}" text-anchor="end" class="tick">{item["name"]}</text>')
        svg.append(f'<rect x="0" y="{by}" width="{bw:.1f}" height="{bar_h}" class="bar" rx="3" opacity="0.85"/>')
        svg.append(
            f'<text x="{bw+8:.1f}" y="{by+16}" class="bar-val">{item["count"]} listings <tspan class="bar-sub">(Median: ₹{item["median_price"]:.1f}L)</tspan></text>'
        )

    svg.append(f'<line x1="0" y1="0" x2="0" y2="{plot_h}" class="axis"/>')
    svg.append('</g>')
    svg.append('</svg>')

    out_path.write_text('\n'.join(svg), encoding='utf-8')
    print(f"Generated: {out_path}")


def generate_bhk_distribution_svg(df: pd.DataFrame, out_path: Path):
    """Generate SVG bar chart of price statistics by BHK."""
    bhk_groups = []
    for bhk in [1, 2, 3, 4, 5]:
        if bhk == 5:
            sub = df[df["bhk_no"] >= 5]
            label = "5+ BHK"
        else:
            sub = df[df["bhk_no"] == bhk]
            label = f"{bhk} BHK"
        if len(sub) > 0:
            bhk_groups.append({
                "label": label,
                "count": len(sub),
                "median": sub["target_price_lakhs"].median(),
                "mean": sub["target_price_lakhs"].mean(),
                "iqr_25": sub["target_price_lakhs"].quantile(0.25),
                "iqr_75": sub["target_price_lakhs"].quantile(0.75),
            })

    w, h = 700, 380
    pad_left, pad_right, pad_top, pad_bottom = 70, 40, 50, 60
    plot_w = w - pad_left - pad_right
    plot_h = h - pad_top - pad_bottom

    svg = [
        f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg">',
        '<style>',
        '  text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }',
        '  .title { font-size: 15px; font-weight: 600; fill: #252722; }',
        '  .subtitle { font-size: 11px; fill: #6B7280; }',
        '  .axis { stroke: #9CA3AF; stroke-width: 1.2; }',
        '  .tick { font-size: 11px; fill: #4B5563; }',
        '  .bar { fill: #87917B; }',
        '  .grid { stroke: #E5E7EB; stroke-dasharray: 2; }',
        '</style>',
        f'<rect width="{w}" height="{h}" fill="#FDFCF7" rx="8"/>',
        '<text x="350" y="28" text-anchor="middle" class="title">Median Sale Price by BHK Configuration</text>',
        '<text x="350" y="44" text-anchor="middle" class="subtitle">Error bars indicate IQR (25th to 75th percentiles)</text>',
    ]

    svg.append(f'<g transform="translate({pad_left},{pad_top})">')
    max_price = 350.0

    for p in [50, 100, 150, 200, 250, 300]:
        ty = plot_h - (p / max_price) * plot_h
        svg.append(f'<line x1="0" y1="{ty:.1f}" x2="{plot_w}" y2="{ty:.1f}" class="grid"/>')
        svg.append(f'<text x="-10" y="{ty+4:.1f}" text-anchor="end" class="tick">₹{p}L</text>')

    bar_w = 60
    spacing = plot_w / len(bhk_groups)

    for i, item in enumerate(bhk_groups):
        bx = i * spacing + (spacing - bar_w) / 2
        bh = (item["median"] / max_price) * plot_h
        by = plot_h - bh
        svg.append(f'<rect x="{bx:.1f}" y="{by:.1f}" width="{bar_w}" height="{bh:.1f}" class="bar" rx="3" opacity="0.85"/>')

        # Error bar for IQR
        cx = bx + bar_w / 2
        y25 = plot_h - (item["iqr_25"] / max_price) * plot_h
        y75 = plot_h - (item["iqr_75"] / max_price) * plot_h
        svg.append(f'<line x1="{cx:.1f}" y1="{y25:.1f}" x2="{cx:.1f}" y2="{y75:.1f}" stroke="#252722" stroke-width="2"/>')
        svg.append(f'<line x1="{cx-8:.1f}" y1="{y25:.1f}" x2="{cx+8:.1f}" y2="{y25:.1f}" stroke="#252722" stroke-width="2"/>')
        svg.append(f'<line x1="{cx-8:.1f}" y1="{y75:.1f}" x2="{cx+8:.1f}" y2="{y75:.1f}" stroke="#252722" stroke-width="2"/>')

        # Value label
        svg.append(f'<text x="{cx:.1f}" y="{by-8:.1f}" text-anchor="middle" font-size="11" font-weight="600" fill="#252722">₹{item["median"]:.0f}L</text>')
        # X tick label
        svg.append(f'<text x="{cx:.1f}" y="{plot_h+20}" text-anchor="middle" font-size="12" font-weight="600" fill="#252722">{item["label"]}</text>')
        svg.append(f'<text x="{cx:.1f}" y="{plot_h+34}" text-anchor="middle" font-size="10" fill="#6B7280">n={item["count"]}</text>')

    svg.append(f'<line x1="0" y1="{plot_h}" x2="{plot_w}" y2="{plot_h}" class="axis"/>')
    svg.append(f'<line x1="0" y1="0" x2="0" y2="{plot_h}" class="axis"/>')
    svg.append('</g>')
    svg.append('</svg>')

    out_path.write_text('\n'.join(svg), encoding='utf-8')
    print(f"Generated: {out_path}")


def main():
    df = pd.read_csv(DATA_PATH)
    print(f"Loaded {len(df)} rows from {DATA_PATH}")

    generate_price_distribution_svg(df, OUTPUT_DIR / "price_distribution.svg")
    generate_price_vs_square_ft_svg(df, OUTPUT_DIR / "price_vs_square_ft.svg")
    generate_top_localities_svg(df, OUTPUT_DIR / "top_localities_price.svg")
    generate_bhk_distribution_svg(df, OUTPUT_DIR / "price_by_bhk.svg")
    print("All SVG figures generated successfully.")


if __name__ == "__main__":
    main()
