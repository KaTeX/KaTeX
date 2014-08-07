require 'json'

require 'rubygems'

require 'ttfunk'

def metrics_for_file(filename)
  file = TTFunk::File.open(filename)
  per_em = 1.0 * file.header.units_per_em

  chars = {}

  file.cmap.unicode[0].code_map.sort.each do |u, g|
    horiz = file.horizontal_metrics.for(g)

    # width = (horiz.advance_width / per_em).round(3)
    height = 0
    depth = 0
    italic = 0

    glyph = file.glyph_outlines.for(g)
    if glyph
      height = (glyph.y_max / per_em).round(3)
      depth = (-glyph.y_min / per_em).round(3)
      italic = [0, (glyph.x_max - horiz.advance_width) / per_em].max.round(3)
    end

    chars[u] = {
      # :width => width,
      :height => height,
      :depth => depth,
      :italic => italic,
    }
  end

  chars
end

font_dir = File.join(File.dirname(__FILE__), 'static/fonts/')
metrics = {}

%w[Main-Regular Math-Italic AMS-Regular
   Size1-Regular Size2-Regular Size3-Regular Size4-Regular].each do |face|
  metrics[face] = metrics_for_file(File.join(font_dir, 'KaTeX_%s.ttf' % face))
end

puts "var metricMap = %s;" % metrics.to_json
